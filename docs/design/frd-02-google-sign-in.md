# FRD-02 Google Sign-In and Sign-Out — Technical Design

## Overview

FRD-02 adds Google OpenID Connect sign-in and sign-out to the already-deployed FRD-01 foundation, additively. It introduces five API endpoints, three new PostgreSQL tables, a server-side session as the security principal, double-submit CSRF protection, hybrid rate-limit keying, and a shared owner-scope helper that later journal features must use. One runtime dependency (`openid-client`, pinned) and one DEV/SIT Compose test service (a local stub OpenID provider) are justified in the feature ADRs. Deployment mode is `manual`: the team promotes the same image tags DEV → SIT with migrations run first; IRIS writes no deployment plan.

## Background / Context

`docs/source/TDD-01.md` is the frozen, binding project authority: "A feature-level decision that must change a rule in this TDD needs a new TDD (TDD-02), not a local exception" (`TDD-01.md:10`). It mandates the stack, the same-origin boundary, API-only database access, the auth flow, and the quality gates. `AGENTS.md` repeats those rules and requires additive feature folders, small shared-file edits, and same-image/tag promotion with retained evidence. `docs/adrs/001-foundation-boundary-and-data-access.md` is Accepted; it records the modular monolith boundary with a STRIDE threat model and explicitly defers identity work to a later ADR (`:25, :33, :41`). This design extends ADR-001; it does not supersede it.

The approved requirement baseline (`docs/requirement/frd-02-google-sign-in.md`, Analysis gate approved 2026-11-25) supplies FR-02-01…14, RS-001…015, SEC-001…012, the NFR table, and the Decision Register. There is no standalone NFR document or C4 diagram in the repository; NFRs live in the baseline (`:210-230`) and `docs/source/SRS-01.md` §15. The OpenSpec specs under `openspec/specs/` describe FRD-01 only; no auth/identity/session spec exists yet. No active customer overlay applies (`active.json` → `customerId: null`), so the governance default "prefer a modular monolith" remains in force.

Governance obligations that shape this design: `baseline-policy.json` → `security.nonOverridable.threat-model-required-for-new-external-boundaries` requires a STRIDE threat model in the ADR for the OAuth callback/session boundary; `identity-provider-public-registration-requires-review` requires the ADR to state why self-service registration exists, what a new principal can access immediately, and the server-side authorization checks independent of Google's authentication; `architecture.nonOverridable.boundary-decision-requires-adr` makes the persistence choice, integration style, and the DEV/SIT Compose topology addition ADR-backed. All three are satisfied by ADR-002…ADR-006.

Human decisions taken during this Design stage: deployment mode `manual`; data access continues on the shipped raw-SQL/`pg` mechanism (DEC-004 option a) with the deviation recorded for later TDD-02 reconciliation; identity verification uses pinned `openid-client` (DEC-003); automated sign-in uses a small purpose-built stub OpenID provider container in DEV/SIT Compose (DEC-003). No TDD-01 rule is changed.

## Codebase Discovery Findings

Read-only discovery of the shipped FRD-01 implementation (cross-checked against the baseline's `## Current State`, `frd-02-google-sign-in.md:74-90`):

- **API assembly** — `apps/api/src/app.ts:33-37` registers plugins in order `requestId → securityHeaders → errors → database → rateLimit`; `app.ts:39-56` declares `GET /api/v1/health`, `POST /api/v1/test/validate`, and `GET /api/v1/ready` inline at literal paths. There is no `modules/` directory, prefix, or auth/session/csrf plugin to extend; FRD-02 adds them without reordering these plugins.
- **Error envelope** — `apps/api/src/plugins/errors.ts:27-48` maps `VALIDATION_FAILED` → 400 and a *thrown* error coded `RATE_LIMIT_EXCEEDED` → 429; `packages/shared/src/index.ts:4-10` defines `{ error: { code, message, fields? } }`. No 401/`UNAUTHORIZED` or `CSRF_INVALID` mapping exists. `plugins/rate-limit.ts:9-17` currently *returns* an `Error` from `errorResponseBuilder`; the shipped test asserts only status 429 (`app.test.ts:116-121`) and does not prove the error body — FRD-02 must add that assertion.
- **Rate limiting** — `@fastify/rate-limit` is configured with `max: 300`, `timeWindow: "1 minute"`, `keyGenerator: (request) => request.ip` (`apps/api/src/plugins/rate-limit.ts:5-8,21-23`). There is no `trustProxy` setting in `apps/api/src`, while nginx sets `X-Forwarded-For` (`apps/web/nginx.conf:11`); keying signed-out requests on the socket IP behind nginx therefore identifies the proxy hop. FRD-02 configures proxy trust explicitly and verifies it.
- **Logging** — `apps/api/src/plugins/request-id.ts:4-10` generates a UUID, sets `x-request-id` and a `request_id` child-log field; the Fastify/pino logger is enabled at `app.ts:29-31` with no redaction option. No `user_id`, session ID, or token field is repo-authored. Because framework request-completion logs exist, the baseline's claim that logs contain "no status/duration" (`frd-02-google-sign-in.md:81`) is stronger than the code proves; the design requires explicit redaction rather than relying on absence.
- **Security headers** — `apps/api/src/plugins/security-headers.ts:4-13` sends `nosniff` and a restrictive CSP on every response, and HSTS only when `APP_ENV === "sit"`. No change is needed; cookie attributes are set per session.
- **Data layer** — persistence is hand-written SQL over `pg`, not Drizzle: `apps/api/package.json:14-22` has no Drizzle dependency; `apps/api/src/plugins/database.ts:2,10-26` creates the `pg.Pool`; `apps/api/src/db/migrate.ts:21-36,41-68` sorts `*.sql` filenames lexicographically and applies pending files verbatim. `applyMigrations()` is called only from tests (`app.test.ts:267,281,300`); the API container starts the server only (`apps/api/Dockerfile:18`) and promotion supplies an external `MIGRATE_COMMAND` (`scripts/ci/promote-release.mjs:32,42`). Migrations are two separate queries (SQL then `__migrations` insert) with no transaction (`migrate.ts:56-59`).
- **Schema** — only `apps/api/src/db/migrations/20261121000000_create_users.sql` exists: a `uuidv7()` function (`:7-16`) and `users` (`:18-25`) with `id UUID PRIMARY KEY DEFAULT uuidv7()`, `email TEXT NOT NULL UNIQUE` (case-sensitive, no lowercased index), `display_name`, `time_zone`, `created_at`, `is_demo DEFAULT false`. No `sessions`, `user_identities`, `profiles`, schema index, or repository layer exists today.
- **Shared contracts** — `packages/shared/src/index.ts:1-18` exports only `ApiErrorEnvelopeSchema`, `FoundationValidationInputSchema`, and `ApiErrorEnvelope`. Web declares `@opengym/shared` but imports no API code (`apps/web/src/app.tsx:8-52`).
- **Web shell** — `BrowserRouter` with `ShellNavigation` outside `<Routes>` and six routes plus not-found (`apps/web/src/app.tsx:10-47`); no auth provider, context, or guard. The welcome buttons are labelled "Sign in with Google"/"Try the demo" and inert via `aria-disabled` and `tabIndex={-1}` (`apps/web/src/features/welcome/WelcomeScreen.tsx:45-60`); the required active label is "Continue with Google". `ShellNavigation.tsx:6-47` has no avatar control.
- **Configuration** — `APP_ENV` is read only by the security-header plugin; `AUTH_TEST_PROVIDER`, `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `OIDC_REDIRECT_URI` appear only in docs/TDD-01 §7.1. `docker-compose.yml` has only `db`/`api`/`web`; `.env.example` has only port/Postgres variables; no stub provider container exists.
- **Test/release harness** — Vitest + Fastify `inject` with real PostgreSQL and per-process databases (`apps/api/src/app.test.ts:17-25`; `apps/api/test/setup.ts:13-42`; `scripts/test-runner.mjs:10-61`); Playwright + axe at `e2e/tests/welcome.spec.ts:4-48`. `e2e/playwright.config.ts:27-31` starts `pnpm --filter @opengym/web start` although `build` is only `vite build` and no `dist/server.mjs` exists; FRD-02's E2E harness must use a working static-server entry. CI builds images tagged with the commit SHA, verifies release evidence, and promotes with `docker compose -f docker-compose.release.yml ... up -d --no-build` (` .gitlab-ci.yml:85-117`; `scripts/ci/promote-release.mjs:30-52`; `docs/deploy/dev-to-sit-promotion.md:5-26`). No `artifacts/` evidence is checked in.
- **Cross-check corrections to the baseline** — (i) the rate-limit envelope path is declared but not proven by the shipped test; (ii) "not clickable" is a comment in `e2e/tests/welcome.spec.ts:25-27`, not an assertion; (iii) the claim of no status/duration log fields overstates what `Fastify({ logger: true })` guarantees. These are recorded as design requirements, not as changes to the approved baseline.

## Goals

- Implement FR-02-01…14 and RS-001…015 additively, with every AC/NAC named in its test (TDD-01 §9).
- Create the identity, session, and profile primitives once, so later FRDs reuse them rather than re-implementing authorization (FR-02-12; BR-02-10).
- Keep the FRD-01 shell, Dialog, validation, headers, health/readiness, migration mechanism, and same-tag promotion intact.
- Produce the ADRs required by governance, including the STRIDE threat model, and record all requirement-to-design traceability.

## Non-Goals

- Profile editing (FRD-03), demo journals (FRD-36), Google Sheets authorization (FRD-34), account deletion (FRD-35), dark-theme/alternate-accent activation (FRD-07), Anthropic calls, and journal-data features.
- UAT and production deployment: the definition of done names DEV and SIT only (baseline `:67, :280`).
- Any change to a TDD-01 rule; if a rule must change, that is TDD-02, not a local exception (`TDD-01.md:10`). No Drizzle adoption in this increment (ADR-004).
- An IRIS deployment plan or deployment-topology ADR for the ladder/target/strategy: mode is `manual`, and this design does not change the production topology.

## Proposed Design

### Component boundaries and additive placement

Browser traffic stays same-origin: nginx serves the SPA and proxies `/api/` to the API (`apps/web/nginx.conf:4-17`); Vite proxies `/api/v1` in development (`apps/web/vite.config.ts:6-11`). The API remains the only process holding `DATABASE_URL` and Google client credentials; the stub provider holds neither. Additive placement:

| Area | Change | Existing file touched |
| --- | --- | --- |
| API auth/session/CSRF plugins | New files under `apps/api/src/plugins/`; register after `rateLimit` without reordering `app.ts:33-37` | one-line additions to `apps/api/src/app.ts` |
| Auth feature routes | New folder `apps/api/src/modules/auth/` (routes, service, repository, tests) | one module-registration line in `app.ts` |
| Owner-scope helper | New shared repository helper used by all later journal modules | none in FRD-01 |
| Web auth feature | New folder `apps/web/src/features/auth/` (sign-in button, settings, route guard) | small edits to `apps/web/src/app.tsx` route table and `ShellNavigation.tsx` avatar |
| Shared schemas | New Zod schemas for the five endpoints and error codes, appended to `packages/shared/src/index.ts` | small additive export block only |
| Schema index | New additive index file for the three tables; no Drizzle schema (ADR-004) | none (no index exists today) |

### Sign-in flow (FR-02-01, FR-02-02)

1. The active "Continue with Google" button links to `GET /api/v1/auth/google/start?returnTo=<known-route>`.
2. The API uses pinned `openid-client` for provider discovery and builds the authorization URL with PKCE (`S256`), a random `state`, a random `nonce`, and scopes `openid email profile`. It stores `state`, `nonce`, PKCE verifier, `returnTo`, and a 10-minute expiry in a signed, HttpOnly, `SameSite=Lax` transient cookie derived from `SESSION_SECRET`. This cookie binds the callback; it is never an authorization credential.
3. `GET /api/v1/auth/google/callback` exchanges the code with the verifier, then validates signature, `iss`, `aud`, `exp`, `state`, and `nonce`. On success it resolves or creates the identity (ADR-003), creates a session, sets the session cookie, and redirects to the allowlisted `returnTo` or `/today`.
4. On any failed check, it creates no session, sets no session cookie, and redirects to `/?auth_error=1`; the welcome screen shows "We could not sign you in. Please try again." with a "Try again" action. No token, email, or exception detail goes into the URL or logs.

A signed-in user opening `/auth/google/start` or `/auth/csrf` simply starts a new safe/idempotent flow or refreshes the CSRF token; those GETs carry no changing state and need no CSRF token themselves (DEC-008).

### Session as the security principal (FR-02-05, FR-02-06, FR-02-08)

`sessions.id` is a 256-bit random token, base64url-encoded only in the `HttpOnly`, `SameSite=Lax`, `Secure`-in-SIT cookie; the raw value is never logged or put in a URL. Every protected request resolves the session row from the cookie, rejects missing/expired rows with 401 `UNAUTHORIZED`, and moves `expires_at` forward by 30 days from the current request (idle timeout). Sign-out deletes the row and clears the cookie; reuse of the old cookie then returns 401. The request-ID plugin adds `user_id` when a session resolves; pino redaction covers session ID, ID token, access token, and the transient auth cookie.

### CSRF (FR-02-09)

`GET /api/v1/auth/csrf` returns `{ csrfToken }` and sets a readable `XSRF-TOKEN` cookie (`HttpOnly` absent, `SameSite=Lax`, `Secure` in SIT). The token is an HMAC of the session ID with `SESSION_SECRET`, so no new session column is needed and the session ID is not exposed. Every POST/PUT/PATCH/DELETE, including sign-out, must send `X-CSRF-Token` matching the cookie; failure is 403 with `{ error: { code: "CSRF_INVALID", ... } }`. Error mapping is added to `apps/api/src/plugins/errors.ts` alongside 401/404/429; the rate-limit builder is corrected so the body also proves `RATE_LIMIT_EXCEEDED` (Discovery finding).

### Rate limiting (FR-02-14, DEC-008)

The general 300/minute limit is retained. Signed-out requests keep IP-based keying; once a session resolves, the key is the session identity. Fastify `trustProxy` is configured for the single nginx hop so `request.ip` behind the proxy reflects the client, and forwarded headers from any other source are not trusted. Signed-out callers behind one NAT share a bucket — an accepted trade-off of DEC-008 option (a). The key material is never logged.

### Owner-scope authorization (FR-02-12)

A single shared repository helper takes `userId` as its first parameter and applies the `user_id` predicate to every journal-data query; a query that omits it throws and cannot execute. Cross-user reads return 404 `NOT_FOUND`, not 403, to avoid existence disclosure. A unit test proves a query without `user_id` fails, and an API test with a second user proves 404. The helper is the enforcement point required by `baseline-policy.json` → `security.nonOverridable.auth-check-required` and `tenant-isolation-independent-of-ai-output`, independent of whatever identity Google confirms.

### Data access and migrations (ADR-004)

FRD-02 extends the shipped mechanism: three versioned SQL files with `YYYYMMDDHHMMSS_` prefixes, applied lexicographically in the order `<ts1>_create_user_identities.sql`, `<ts2>_create_sessions.sql`, `<ts3>_create_profiles.sql`, using the existing `uuidv7()` function. All data access uses parameterized queries through the existing `pg.Pool`; no schema push, no Drizzle dependency, no second ORM, no rewrite of the `users` migration. Migrations run as a separate step before the new API version (the application does not self-migrate); recovery after a successful migration is forward-only.

### Stub provider (FR-02-11, ADR-006)

A small Compose service in DEV/SIT exposes authorize, token, and JWKS endpoints plus a sign-in form, and issues real signed ID tokens so the production validation path is unchanged. It is enabled only with `AUTH_TEST_PROVIDER=true`; the API refuses to start when that flag is true and `APP_ENV` is `uat` or `prod`, with an error naming the setting (AC-02-13). The stub receives no database credentials and no Google credentials. Test signing keys are generated in the test container and never committed.

### API interface

All routes are under `/api/v1`, JSON only, with the established envelope `{ "error": { "code": "...", "message": "...", "fields": {} } }` and upper-snake-case codes: `VALIDATION_FAILED` (400), `UNAUTHORIZED` (401), `CSRF_INVALID` (403), `NOT_FOUND` (404), `RATE_LIMIT_EXCEEDED` (429), `DATABASE_UNAVAILABLE` (503). New shared Zod schemas are appended to `packages/shared/src/index.ts`; error codes remain strings in that package to keep the edit small.

| Method | Path | Authentication / CSRF | Request | Success | Errors |
| --- | --- | --- | --- | --- | --- |
| GET | `/auth/google/start` | public GET; `returnTo` query, allowlisted | `returnTo?: string` (one of `/today`,`/train`,`/fuel`,`/coach`,`/grow`,`/settings`) | 302 to IdP authorize URL; signed transient auth cookie | 400 `VALIDATION_FAILED` for an unknown `returnTo` |
| GET | `/auth/google/callback` | public GET; `state`, `code`, `iss` validated against transient cookie | `code: string`, `state: string`, `iss?: string` | 302 to `returnTo` or `/today`; session cookie set | 302 to `/?auth_error=1`, no session, on any failed check |
| POST | `/auth/sign-out` | session + `X-CSRF-Token` | empty body | 204; session deleted, cookie cleared | 401 `UNAUTHORIZED`, 403 `CSRF_INVALID` |
| GET | `/me` | session | none | 200 `{ id, displayName, email, timeZone }` | 401 `UNAUTHORIZED` |
| GET | `/auth/csrf` | session | none | 200 `{ csrfToken }` + readable `XSRF-TOKEN` cookie | 401 `UNAUTHORIZED` |

Example — signed-in `/me`:

```json
{ "id": "0199f000-0000-7000-8000-000000000001", "displayName": "Alex Morgan", "email": "alex@example.com", "timeZone": "Europe/London" }
```

Example — CSRF failure on sign-out:

```json
{ "error": { "code": "CSRF_INVALID", "message": "A valid CSRF token is required." } }
```

These five endpoints return single bounded objects or redirects, not collections; pagination is not applicable (governance `coding.nonOverridable.collection-endpoints-must-paginate`).

### Web client (FR-02-10, FR-02-13)

`apps/web/src/features/auth/` owns the sign-in button (active label "Continue with Google", loading state, error message with "Try again"), the route guard, and the minimal `/settings` page ("Your account — Make it yours.", display name, email, "Sign Out"). A signed-out person opening any route except `/` goes to `/` and returns to the requested route after sign-in via the `returnTo` parameter; a signed-in person opening `/` goes to `/today`. `/settings` uses a shared Zod schema and TanStack Query for `/me`. The header avatar shows the first letter of the display name and links to `/settings`. "Try the demo journal" stays inactive. Styling uses CSS Modules and `design-system/opengym/tokens.css` only; dark theme is not activated.

## Alternatives Considered

| Alternative | Why not chosen | ADR |
| --- | --- | --- |
| Drizzle for new tables only / full foundation migration to Drizzle | Two mechanisms in one database, or a rewrite of deployed behavior; DEC-004 option (a) chosen and no TDD-01 rule may change | ADR-004 |
| Google `google-auth-library` or hand-rolled token/JWK verification | Pinned `openid-client` gives the required checks with less bespoke security code; baseline DEC-003 | ADR-002 |
| Implicit/client-side flow or separate API origin | Tokens in the browser, CORS/session complexity, and a break of the mandated single origin | ADR-002, ADR-001 |
| Update `users.email` on every sign-in, relax its unique constraint, or split the first-sign-in inserts | Breaks identity-by-subject (BR-02-01) and atomicity (AC-02-01/02); baseline DEC-001/DEC-002 recommendations | ADR-003 |
| JWT session without a server row | No server-side revocation on sign-out, contrary to TDD-01 §4 and SRS-AUTH-04 | ADR-005 |
| Separate rate-limit buckets per auth route, or IP keying for everyone | DEC-008 recommendation: IP before session, session after; per-route buckets do not address the signed-in/signed-out distinction | ADR-005 |
| Off-the-shelf mock IdP image or in-process test fake | Larger unowned surface, or no real HTTP callback path; small purpose-built stub container chosen | ADR-006 |
| IRIS deployment plan with ladder/target/strategy | Human chose `manual`; the team's existing same-tag procedure applies and no production topology changes | — |

## Data Model / API Changes

| Element | Change | Contract / constraint |
| --- | --- | --- |
| `user_identities` | New table | `id UUID PK DEFAULT uuidv7()`; `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`; `provider TEXT NOT NULL CHECK (provider = 'google')`; `subject TEXT NOT NULL`; `email TEXT NOT NULL`; `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`; `UNIQUE (provider, subject)`; index on `user_id`. |
| `sessions` | New table | `id TEXT PRIMARY KEY` (256-bit random, base64url); `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`; `created_at`, `last_seen_at`, `expires_at TIMESTAMPTZ NOT NULL`; `user_agent TEXT`; indexes on `user_id` and `expires_at`. |
| `profiles` | New table | `user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE`; `time_zone TEXT NOT NULL` (authoritative IANA zone); `weight_unit TEXT NOT NULL DEFAULT 'kg' CHECK IN ('kg','lb')`; `kcal_target INTEGER NOT NULL DEFAULT 2500`; `protein_target_g INTEGER NOT NULL DEFAULT 160`; `carbs_target_g INTEGER NOT NULL DEFAULT 300`; `fat_target_g INTEGER NOT NULL DEFAULT 70`; `theme TEXT NOT NULL DEFAULT 'light'`; `accent TEXT NOT NULL DEFAULT 'peach'`; `training_goal TEXT NOT NULL DEFAULT ''`; `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`. |
| `users` | Unchanged | The FRD-01 migration is not edited. `email` stays case-sensitive `UNIQUE`; first-sign-in value is immutable (ADR-003); `time_zone` is populated from the same captured IANA value as `profiles.time_zone`. |
| Five auth endpoints | New surface | Exact methods, paths, auth, fields, errors and examples in "API interface" above. |
| Shared Zod schemas | New exports | Appended to `packages/shared/src/index.ts`; client and server validate the same shapes. |
| Error envelope | New codes | `UNAUTHORIZED`, `CSRF_INVALID`, `NOT_FOUND` added alongside existing codes; `RATE_LIMIT_EXCEEDED` body assertion added. |

## Non-Functional Requirements

This table is the authority QA resolves its SLOs against; every row of the approved baseline's NFR table is carried forward with a measurable target. No target has been invented where the source gave none.

| ID / Category | Measurable target | Measured how / environment | Source |
| --- | --- | --- | --- |
| NFR-SEC-02 / cookie | `HttpOnly` on the session cookie, `SameSite=Lax`, and `Secure` when `APP_ENV=sit`; verified on the session-creating `Set-Cookie` | Automated API test NAC-02-01 in SIT CI | stated |
| NFR-SEC-01 / owner scope | A repository query without `user_id` throws; a cross-user read returns 404 `NOT_FOUND` | Unit test NAC-02-02 + cross-user API test, DEV/SIT CI | stated |
| NFR-SEC-06 / rate limit | 301st request in one minute keyed to one session returns 429 with `error.code = RATE_LIMIT_EXCEEDED`; signed-out keying is source IP | Automated API test NAC-02-03, DEV/SIT CI | stated |
| NFR-PRIV-01 / log privacy | Zero emitted pino lines contain a session ID, ID token, or access token across sign-in, callback, sign-out, and error paths | Log-capture test NAC-02-04 + redaction config review, DEV/SIT CI | stated |
| NFR-SEC-07 / compliance | All applicable OWASP ASVS 4.0 L1 V2/V3 authentication and session checks pass | Security review report NAC-02-05, SIT | stated |
| NFR-PERF-01 / latency | `GET /api/v1/me` p95 ≤ 300 ms at 50 concurrent users with 1 year of data per user | k6 load test NAC-02-06, SIT | stated |
| NFR-A11Y-01 / accessibility | Zero axe-core level-A/AA violations on welcome and `/settings` at 360/768/1440 px | Playwright + axe NAC-02-07, CI | stated |
| NFR-SEC-05 / secrets | Zero secrets in source/CI config; `SESSION_SECRET` and `GOOGLE_CLIENT_SECRET` only from environment | CI secret scan + config review, every commit | stated |
| NFR-A11Y-02 / keyboard | Every new control keyboard-operable; shared `Dialog` focus trap and return preserved | Playwright keyboard test, CI | stated |
| NFR-A11Y-03 / touch | Avatar and settings actions ≥ 44 × 44 CSS px | Playwright measurement at narrow viewport, CI | stated |
| NFR-UX-001 / responsive | No horizontal scroll at 360, 768, and 1440 px | Playwright layout test, CI | stated |
| NFR-PERF-004 / LCP | Welcome-page LCP ≤ 2.5 s on Lighthouse mobile simulated 4G | Lighthouse CI/SIT | stated |
| NFR-OPS-002 / logging | Every API log line is valid JSON with `request_id`, plus `user_id` when signed in | API/log assertion, DEV/SIT CI | stated |
| NFR-OPS-003 / migrations | Every database change is a versioned `YYYYMMDDHHMMSS_*.sql` migration applied to empty and preceding schemas | Migration CI gate, CI/SIT | stated |
| NFR-SEC-09 / dependencies | Zero known critical/high findings at release, with CycloneDX SBOM produced | CI dependency scan and release artifact, CI | stated |

Non-blocking thresholds deliberately not invented here: authentication-specific availability/SLO numbers, auth-monitoring alerts, retention/backup/RPO/RTO targets, and a production rollout strategy have no source values (baseline `:169, :300-301, :314-317`). They are Open Questions below, not guessed numbers.

## Testing Strategy

- Every AC/NAC identifier appears in the executed test name (TDD-01 §9): AC-02-01…14, NAC-02-01…07. Use Fastify `inject` with a real isolated PostgreSQL database and free ports, as FRD-01 does (`apps/api/test/setup.ts:13-42`; `scripts/test-runner.mjs:10-61`); concurrent worktrees must not share databases or ports.
- Stub-provider E2E covers first sign-in, returning sign-in, unchanged display name, wrong `state` (no session + error message), sign-out with old-cookie 401, protected-route return-to, loading/error states, avatar, and `/settings`. Fix the E2E static-server entry (Discovery finding) so these tests actually start.
- API tests cover ID-token negative cases (signature, issuer, audience, expiry, nonce, PKCE, state), cookie attributes, CSRF failure body, rate-limit boundary at 301 with `error.code`, `AUTH_TEST_PROVIDER=true` startup refusal in `uat`, log redaction, owner-scope unit failure, cross-user 404, and the transient auth cookie TTL.
- Migrations are applied to an empty database and the preceding schema in CI; all test-created records carry a discoverable test tag and are cleaned up by the suite's own teardown (governance `coding.nonOverridable.e2e-suite-self-contained-cleanup` and `test-created-data-is-tagged`).
- QA runs k6 for `/me` at 50 concurrent users with a year of seeded data, Playwright + axe on both changed screens, Lighthouse mobile for the welcome page, and the ASVS L1 V2/V3 review. One manual real-Google sign-in/out check runs in SIT once DEP-002 (PO registration) is satisfied; automated tests never depend on it.
- Evidence retained: AC/NAC results, SBOM, dependency scan, ASVS report, migration output, deployment record, and SIT smoke evidence.

## Rollout Plan

### Deployment (manual)

**How this is deployed today.** FRD-01 is implemented and deployed to DEV and SIT using the documented same-tag, migration-first procedure in `docs/deploy/dev-to-sit-promotion.md:5-26` and `.gitlab-ci.yml:85-117`: one integration-branch build produces the web/API image pair tagged with the commit SHA; `scripts/ci/promote-release.mjs:30-52` validates DEV evidence, runs an environment-owned `MIGRATE_COMMAND`, brings up `docker-compose.release.yml` with `--no-build`, and smoke-checks the stack before retaining evidence. The API container itself does not run migrations (`apps/api/Dockerfile:18`; `applyMigrations` is test-only). SIT uses the shared-Linux-VM Compose fallback until TDD-OI-01 is resolved.

**What this change asks of whoever deploys it.**

1. Keep the identical web/API tag from one successful build for both DEV and SIT; do not rebuild between environments. Retain the existing lint/typecheck/test/coverage, migration, Playwright+axe, dependency-scan/SBOM, Lighthouse, and k6 evidence.
2. Before starting the new API in each environment, apply the three new timestamp-prefixed migrations as a distinct step against that environment's database, in filename order after `20261121000000_create_users.sql`. Verify `user_identities`, `sessions`, and `profiles` exist before the API starts. If a migration fails, stop the release; recover forward with a reviewed migration, not a schema rollback.
3. Add the stub OpenID provider Compose service to the DEV and SIT stacks only (ADR-006). It must share no database credentials or Google credentials with the API. Confirm `AUTH_TEST_PROVIDER=true` is used only where `APP_ENV` is `dev` or `sit`; the API's fail-closed startup check refuses `uat`/`prod`.
4. Set the configuration and secret names below through the approved environment/secret mechanism. Never commit or log their values. Google OAuth client registration and the exact redirect URIs per environment (DEP-002/TDD-OI-02) are PO-owned; without them the automated stub path still works but the manual real-Google SIT check cannot.
5. After DEV evidence is retained, repeat steps 2–4 for SIT with the same image tags and the distinct SIT database/ports. **SIT smoke check:** confirm `/api/v1/health` and `/api/v1/ready`, the one-origin web route, request-ID logging with `user_id` when signed in, SIT HSTS and session-cookie `Secure`/`HttpOnly`/`SameSite=Lax`, a stub-provider sign-in to `/today`, a `/me` response, sign-out with old-cookie 401, and the single manual real-Google sign-in/out check when registration is available.

**Required configuration and secret names** (names only — values stay in the environment/secret manager):

| Name | Purpose | Where |
| --- | --- | --- |
| `APP_ENV` | `dev` or `sit`; selects SIT cookie/header behaviour and the fail-closed guard | DEV and SIT |
| `DATABASE_URL` | PostgreSQL connection for the API only | DEV and SIT |
| `PUBLIC_BASE_URL` | Public origin used in redirects and configured Google redirect URIs | DEV and SIT |
| `SESSION_SECRET` | Signing key for transient auth cookie and CSRF HMAC | DEV and SIT, secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client identifier | DEV/SIT when real Google is enabled, secret-adjacent config |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | SIT real-Google check / UAT later, secret |
| `OIDC_REDIRECT_URI` | Callback URL registered for the environment | DEV/SIT when real Google is enabled |
| `AUTH_TEST_PROVIDER` | `true` only with the stub in DEV/SIT; never `true` in `uat`/`prod` | DEV and SIT only |

**Rollback:** application containers may be rolled back only to a release compatible with the current schema. After the identity/session migrations succeed, schema rollback is unsafe; use a forward corrective migration.

## Requirement Traceability

| Requirement ID | Covered by |
| --- | --- |
| FR-02-01 | Proposed Design → Sign-in flow; ADR-002 |
| FR-02-02 | Sign-in flow step 4; ADR-002 STRIDE; ADR-005 |
| FR-02-03 | Data Model `users`/`profiles`/`user_identities`; ADR-003 |
| FR-02-04 | ADR-003 (subject key, immutable display name and email) |
| FR-02-05 | Session as security principal; ADR-005; NFR-SEC-02 |
| FR-02-06 | Session idle expiry; ADR-005 |
| FR-02-07 | API interface `/me`; NFR-PERF-01 |
| FR-02-08 | Sign-out; ADR-005 |
| FR-02-09 | CSRF section; ADR-005; NFR-SEC-01 |
| FR-02-10 | Web client route guard; sign-in flow `returnTo` |
| FR-02-11 | Stub provider; ADR-006; NFR-SEC-06 guard |
| FR-02-12 | Owner-scope authorization; ADR-005; NFR-SEC-01 |
| FR-02-13 | Web client avatar and `/settings`; NFR-A11Y-02/03 |
| FR-02-14 | Rate limiting; ADR-005; NFR-SEC-06 |
| NFR-SEC-02, NFR-SEC-01, NFR-SEC-06, NFR-PRIV-01, NFR-SEC-07, NFR-PERF-01, NFR-A11Y-01, NFR-SEC-05, NFR-A11Y-02, NFR-A11Y-03, NFR-UX-001, NFR-PERF-004, NFR-OPS-002, NFR-OPS-003, NFR-SEC-09 | Non-Functional Requirements table (one measurable row each); Testing Strategy; ADR-002, ADR-005 |
| SEC-011 | ADR-002 STRIDE threat model, extending ADR-001 |
| BR-02-01…BR-02-10 | ADR-002, ADR-003, ADR-005; Business rules in requirement baseline |
| DEC-001, DEC-002 | ADR-003 |
| DEC-003 | ADR-002 (library), ADR-006 (stub provider) |
| DEC-004 | ADR-004 |
| DEC-008 | ADR-005 |
| TDD-OI-02 / DEP-002 | Rollout Plan step 4 (PO registration before SIT check) |

## Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Callback misses a validation check (RSK-001) | Pinned OIDC library owns verification; explicit negative tests for state, nonce, signature, issuer, audience, expiry and PKCE; ASVS review; ADR-002 threat model. |
| Session ID or token leaks into logs (RSK-002) | pino redaction, no token in URL/body, log-capture test NAC-02-04, no raw session ID in the CSRF token. |
| Owner-scope helper bypassed by a later FRD (RSK-003) | One enforced helper with `userId` first parameter; unit test proves omission fails; cross-user 404 test; ADR-005. |
| Unique-email collision or changed Google email breaks sign-in (RSK-004) | ADR-003: subject key, immutable `users.email`, updated identity email only, generic failure with no session on collision; no constraint relaxation without TDD-02. |
| Test provider enabled in a real environment (RSK-005) | Fail-closed startup guard and startup test AC-02-13; config review; secret mechanism; stub container absent from UAT/prod stacks. |
| Google registration delays SIT manual check (RSK-006) | Automated stub path independent of Google; PO owns DEP-002; escalate before SIT verification. |
| Schema rollback unsafe after migration (RSK-007) | Migration-first ordering, forward-only recovery, rollback compatibility rule in Rollout Plan. |
| Drizzle/raw-SQL inconsistency (RSK-008) | ADR-004 records the deviation; no second ORM; reconcile through TDD-02, never a local rule change. |
| E2E harness entry does not exist (`dist/server.mjs`) | Fix the E2E static-server entry as a test prerequisite before AC-02 E2E runs (Discovery finding). |
| Proxy IP keying ineffective behind nginx | Explicit `trustProxy` hop configuration and a test that a forwarded client IP changes the signed-out bucket. |

## Open Questions

None blocks this Design gate. These remain owned downstream and are explicitly not given invented targets:

- **DEC-005 / UI Design intake (contested)** — Human/UX at the UI Design gate. The prototype is visual reference only; detailed loading/error/avatar/settings interaction design must follow the light warm-Peach token contract and BRD-01 §7.
- **DEP-002 / TDD-OI-02** — Product Owner must register Google OAuth clients and redirect URIs for DEV/SIT before the manual real-Google SIT check; automated tests use the stub regardless.
- **TDD-OI-01 / ASM-005** — SIT/UAT container host remains a PO/DevOps dependency; the shared-VM Compose fallback applies. Mode is `manual`, so no deployment target decision is made here.
- **DEC-007 and operations gaps** — Production rollout/rollback policy, auth availability SLO, monitoring/alerts, retention, backup/DR/RPO/RTO, support hours, and Google credential rotation have no supplied targets; decide before first production release, outside FRD-02 scope.
- **TDD-02 reconciliation** — The TDD-01 Drizzle rule remains textually in force while FRD-02 extends raw SQL; ADR-004 records this. Any future rule change requires a separately approved TDD-02.
