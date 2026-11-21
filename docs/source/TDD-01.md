# TDD-01 — OpenGym: Technical Design (Project Level)

| Field | Value |
|---|---|
| Document | TDD-01 |
| Version | 1.0 (frozen when planning starts) |
| Date | 2026-11-21 |
| Traces to | BRD-01, SRS-01 |

This TDD sets the technology stack and the rules that apply to the whole project. In each IRIS run, the architect agent writes the feature-level ADRs and the feature TDD **inside** these rules. A feature-level decision that must change a rule in this TDD needs a new TDD (TDD-02), not a local exception.

---

## 1. Stack

| Layer | Technology | Version rule |
|---|---|---|
| Language | TypeScript, `strict: true`, everywhere | TypeScript 5.x |
| Runtime | Node.js | 22 LTS |
| Package manager | pnpm workspaces | 9.x |
| Web client | React + Vite + React Router + TanStack Query | React 19, Vite 6 |
| Styling | CSS Modules with design tokens as CSS custom properties | — |
| API server | Fastify | 5.x |
| Validation | Zod schemas, shared by client and server | 3.x |
| Database | PostgreSQL | 16 |
| ORM and migrations | Drizzle ORM + drizzle-kit (SQL migrations in the repo) | latest stable at FRD-01 |
| Authentication | Google OpenID Connect, authorization code flow with PKCE, server-side sessions | — |
| AI service | Anthropic Claude API through `@anthropic-ai/sdk` | model `claude-opus-5-5` |
| Logging | pino (JSON) | — |
| Unit and integration tests | Vitest; API tests with Fastify `inject` against a real PostgreSQL | — |
| End-to-end tests | Playwright | — |
| Accessibility tests | `@axe-core/playwright` | — |
| Load tests | k6 | — |
| Lint and format | ESLint (typescript-eslint) + Prettier | — |
| Containers | Docker, Docker Compose | — |
| CI | GitLab CI | — |

Do not add a second framework for a job that the stack already covers (for example, no second state library, no second ORM, no CSS-in-JS library). A new runtime dependency must be justified in the feature ADR.

## 2. Repository layout

One repository. pnpm workspaces:

```
opengym/
├── apps/
│   ├── web/                 # React client
│   │   └── src/
│   │       ├── app/         # shell, routes, navigation, providers
│   │       ├── features/    # one folder per feature: workouts/, nutrition/, recovery/, ...
│   │       ├── ui/          # shared components (Button, Dialog, Card, NumberInput, ...)
│   │       └── styles/      # tokens.css, themes
│   └── api/                 # Fastify server
│       └── src/
│           ├── app.ts       # server build, plugin registration
│           ├── plugins/     # auth, session, csrf, rate-limit, errors, request-id
│           ├── modules/     # one folder per feature: routes.ts, service.ts, repo.ts, *.test.ts
│           ├── ai/          # AI gateway (the only code that calls the AI service)
│           └── db/          # drizzle schema, migrations/, seed/
├── packages/
│   └── shared/              # Zod schemas, API types, derived-metric functions (DM-xx), dates
├── e2e/                     # Playwright tests
├── load/                    # k6 scripts
├── docker-compose.yml       # postgres + api + web for DEV
└── .gitlab-ci.yml
```

Rules:
- A feature adds its own folder under `apps/web/src/features/` and `apps/api/src/modules/`. Shared files (route table, navigation, Drizzle schema index, seed index) get small, additive changes only.
- `packages/shared` must not import from `apps/*`. `apps/web` must not import from `apps/api`.

## 3. Architecture

```
Browser (React SPA)
   │  HTTPS, JSON, session cookie
   ▼
Fastify API ──► PostgreSQL
   │
   └──► AI gateway ──► Anthropic Claude API
```

- The web client is a single-page app. It calls only the OpenGym API.
- The API is the only component that calls the database and the AI service.
- In DEV, SIT and UAT, one container serves the API, and one container serves the built web client through a static server with the API under `/api`. The browser sees one origin.

### 3.1 API conventions

- Base path: `/api/v1`.
- JSON only. Request and response bodies are defined as Zod schemas in `packages/shared`.
- Errors: `{ "error": { "code": "VALIDATION_FAILED", "message": "...", "fields": { ... } } }`. Codes are upper snake case.
- Status codes: 200, 201, 204, 400 (validation), 401 (no session), 403 (CSRF), 404 (not found or not owned — NFR-SEC-01), 409 (state conflict, for example a second active workout), 429 (rate limit), 503 (AI service not available).
- Lists use cursor pagination: `?cursor=…&limit=…` (default 20, maximum 100).
- Dates: journal days are `YYYY-MM-DD` strings. Timestamps are ISO 8601 UTC.

### 3.2 Data rules

- Every table that holds journal data has a non-null `user_id` column with a foreign key to `users.id` and `ON DELETE CASCADE` (SRS-DAT-03).
- Every repository function takes `userId` as its first parameter, and every query filters on it. No query for journal data runs without a `user_id` filter (NFR-SEC-01). A shared helper enforces this.
- Primary keys: UUID v7.
- Columns: snake_case. Drizzle field names are snake_case so that column names need no second definition.
- Each entry table has `journal_day DATE NOT NULL` and `created_at TIMESTAMPTZ NOT NULL` (NFR-DATA-01).
- Weights: `weight NUMERIC(6,2)` plus `weight_unit` (`kg` | `lb`) (NFR-DATA-02).
- Migrations: drizzle-kit generates SQL files. Each migration file name starts with a timestamp (`YYYYMMDDHHMMSS_name.sql`), not a sequence number, so that parallel branches do not get the same number.

### 3.3 Derived metrics

- Each derived metric in SRS-01 §14 (DM-01 … DM-08) has **one** function in `packages/shared/src/metrics/`. The API uses these functions to build responses. The client does not compute these metrics again.
- Each function has unit tests with the edge cases in SRS-01 (negative remaining calories, an empty day, a time zone change, a streak with no entry today).

### 3.4 Time zones

- The profile stores an IANA time zone. The client sends it on first sign-in; the person can change it in settings.
- The server computes the journal day of a new entry from the profile time zone, unless the request gives an explicit `journal_day` (date picker, SRS-OVR-08). A future `journal_day` is rejected with 400.

## 4. Authentication and sessions

- Google OpenID Connect: authorization code flow with PKCE and a `state` and `nonce` check. Scopes: `openid email profile`. The Google Sheets scope is requested only when the person connects Sheets (SRS-DAT-02), as an incremental authorization.
- The server creates a session row (`sessions` table) and sets a cookie with a random session ID (NFR-SEC-02). Idle timeout: 30 days (SRS-AUTH-03).
- CSRF: double-submit token. The API returns a token in a readable cookie; the client sends it in an `X-CSRF-Token` header on every changing request.
- **Test sign-in:** for automated tests in DEV and SIT only, the API can use a local stub OpenID provider (a container in `docker-compose.yml`). The setting `AUTH_TEST_PROVIDER=true` turns it on. The API must refuse to start with this setting when `APP_ENV` is `uat` or `prod`.
- **Demo journals:** a demo visitor gets a temporary user row with `is_demo = true`, a copy of the selected demo data, and a session. A scheduled job deletes demo users older than 24 hours (SRS-DEMO-02).

## 5. AI gateway

- All AI calls go through `apps/api/src/ai/`. No other module imports the Anthropic SDK.
- Model: `claude-opus-5-5`. Enable server-side refusal fallbacks (`fallbacks: "default"` with the matching beta header) so that a refused request is retried on a fallback model.
- **Meal estimate** (SRS-NUT-04/05/06): one Messages API call. The input is the description and, when given, the photo (base64 image block). The output must use structured outputs with a JSON schema: a list of items `{ name, portion_g, kcal, protein_g, carbs_g, fat_g }`. The server validates the result with Zod before it returns it. The photo is held in memory only and is never written to disk (NFR-PRIV-02).
- **Coach** (SRS-COA): a streamed Messages API call. The server builds the context from the approved data only (SRS-COA-02). Logged text (food names, notes, exercise names) goes inside a clearly marked data block, and the system prompt says that this block is data, not instructions (NFR-SEC-08). The server streams the answer to the client.
- **Quick log** (SRS-OVR-07): one call with structured output: `{ kind: "set" | "meal" | "checkin", ...fields }`. The result is a proposal; the person confirms it.
- Each AI call has a timeout (meal estimate 30 s, quick log 15 s, coach 60 s) and maps AI errors to `503 AI_UNAVAILABLE` (NFR-REL-02).
- Rate limits per person and per demo session (NFR-SEC-06, SRS-DEMO-04).
- **Test double:** the gateway has an interface. Unit and integration tests use a fake implementation with fixed answers. Only a small, tagged set of tests (`@live-ai`) calls the real service, and only in SIT.
- AI prompts and answers are never logged (NFR-PRIV-01). The gateway logs only the model, latency, token counts and the result status.

## 6. Web client rules

- Design tokens in `apps/web/src/styles/tokens.css`: colours, spacing, radius, type scale, for light and dark themes and the 5 accent colours. Components use tokens only, never raw colour values.
- The visual design follows the prototype: warm neutral background, soft cards, rounded corners, calm tone.
- Server state: TanStack Query. One query key factory per feature. No global client store for server data.
- Forms: controlled inputs with the shared Zod schemas for client validation. The server still validates (NFR-SEC-03).
- Every dialog uses the shared `Dialog` component (focus trap, Escape to close, focus return — NFR-A11Y-02).
- Failed saves keep the input and show a retry action (NFR-REL-01).

## 7. Environments and deployment

| Environment | Purpose | Data | Auth | AI |
|---|---|---|---|---|
| DEV | Developer machine and CI | Seed data, test users | Stub provider allowed | Fake gateway by default |
| SIT | System integration testing after each FRD | Seed data, test users | Stub provider allowed, Google allowed | Real service for `@live-ai` tests |
| UAT | Acceptance by the PO | Demo journals, real Google sign-in | Google only | Real service |

- Each environment runs the same Docker images, with configuration from environment variables (12-factor).
- DEV runs with `docker compose up`.
- SIT and UAT run on a container host. **The host is not yet selected** (see §11, TDD-OI-01). Until it is selected, SIT and UAT run as Docker Compose stacks on a shared Linux VM, with different ports and databases.
- Promotion: an image is built once per commit on the integration branch and promoted DEV → SIT → UAT with the same image tag.
- Database migrations run as a separate step before the new API version starts.

### 7.1 Configuration

| Variable | Purpose |
|---|---|
| `APP_ENV` | `dev`, `sit`, `uat` |
| `DATABASE_URL` | PostgreSQL connection |
| `SESSION_SECRET` | Session signing key |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OIDC_REDIRECT_URI` | Google sign-in |
| `AUTH_TEST_PROVIDER` | `true` only in DEV and SIT |
| `ANTHROPIC_API_KEY` | AI service |
| `AI_GATEWAY` | `fake` or `live` |
| `PUBLIC_BASE_URL` | Public URL of the environment |

## 8. Quality gates

Every merge to the integration branch must pass, in CI:

1. `pnpm lint` and `pnpm typecheck` with zero errors.
2. Unit and API tests (`pnpm test`) with line coverage ≥ 80% on `packages/shared` and `apps/api/src/modules`.
3. Database migrations apply to an empty database and to the previous release's schema.
4. Playwright end-to-end tests for the FRD's acceptance criteria, on Chromium; on Chromium, Firefox and WebKit before UAT.
5. axe-core checks on every screen that the FRD changes (NFR-A11Y-01).
6. Dependency scan with no critical or high findings (NFR-SEC-09). An SBOM (CycloneDX) is produced for each build.
7. k6 load test for each endpoint that the FRD adds or changes, against the NFR-PERF targets, in SIT.

## 9. Testing rules

- Tests use real PostgreSQL (Docker), not mocks of the database.
- The AI gateway is the only component replaced by a fake in tests.
- Every acceptance criterion in an FRD maps to at least one executed test. The test name contains the criterion ID (for example `AC-05-03`).
- Tenant isolation: every endpoint that reads or changes journal data has a test that uses a second user and expects 404 (NFR-SEC-01).
- End-to-end tests use the stub sign-in provider and seed data. They do not depend on the order in which they run.
- Two test runs must be able to run at the same time on one machine (for example in two git worktrees of the repository). Each test run creates its own PostgreSQL database with a unique name and drops it at the end. API and web servers started by tests listen on a free port that the test harness picks. No test uses a fixed port, a fixed database name or another resource that two test runs share.

## 10. Observability

- pino JSON logs with `request_id`, `user_id` (when signed in), route, status and duration. No journal content (NFR-PRIV-01).
- `/health` and `/ready` (NFR-OPS-01).
- Each AI call logs model, latency, input and output token counts, and status.

## 11. Open items

| ID | Item | Owner | Needed before |
|---|---|---|---|
| TDD-OI-01 | Select the container host for SIT and UAT. | PO / DevOps | First SIT deployment of a real-traffic test; the VM fallback in §7 applies until then. |
| TDD-OI-02 | Google OAuth client registration for each environment's redirect URI. | PO | FRD-02 in SIT |
| TDD-OI-03 | Anthropic API key for SIT and UAT, with a spend limit. | PO | FRD-09 in SIT |
