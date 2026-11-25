# FRD-02 Google Sign-In and Sign-Out — End-to-End Discovery and Requirements Baseline

## Document Control

| Field | Value |
| --- | --- |
| Title | FRD-02 Google Sign-In and Sign-Out |
| Version | 1.0 |
| Status | Baseline complete; ready for Architecture |
| Date | 2026-11-25 |
| Prepared from | FRD-02 Google Sign-In and Sign-Out (persisted run input, byte-for-byte from `D:\InApp\opengym-docs\frd\FRD-02-google-sign-in.md`); BRD-01; SRS-01; TDD-01; FRD-01 baseline (`docs/requirement/frd-01-app-foundation.md`, `docs/design/frd-01-app-foundation.md`, `docs/decomposition/01-app-foundation.md`, `docs/adrs/001-foundation-boundary-and-data-access.md`); project `AGENTS.md`; read-only codebase discovery of the implemented FRD-01 foundation (file:line evidence in Current State). |
| Owners and approvers | Product Owner owns business acceptance, UAT/go-live acceptance, business-dispute resolution, and Google OAuth client registration (TDD-OI-02). Analysis-gate approver: the project's Architect, in the IRIS Console. Not self-approved. |
| Decision-status vocabulary | Confirmed / Mandated / Assumed / Recommended / Open – Blocking / Open – Non-blocking / Not Applicable / Deferred. Requirement IDs `FR-02-nn`, `AC-02-nn`, `NAC-02-nn` and `NFR-*` are the canonical IDs from the source FRD/SRS and are kept stable for downstream citation. |

## Run Configuration Answers

The requirement document does not explicitly settle any run-configuration intake answer. Rows are included for each intake answer asked later in the pipeline; none is confirmed.

| Answer | Value | Status | Source |
| --- | --- | --- | --- |
| UI Design | Not stated. A prototype is referenced but explicitly demoted to a visual reference with defects that must not be copied; this does not confirm a `provided` design contract, and there is no `generate` answer either. | contested | FRD-02 header "Prototype reference" and §7; BRD-01 §7 ("The prototype is a visual reference only"; PD-01–PD-06 must not be copied). FRD-02 changes real screens (welcome sign-in states, `/settings`, header avatar), so the UI Design intake must be offered, not skipped. |
| Deep Review | Not stated in source. | absent | No Deep Review mention in FRD-02; the Orchestrator presents the Deep Review offer at its own step. |
| Target | `full` is recorded by run intake, not stated by the requirement source. | absent | FRD-02 §13 names DEV and SIT deployment but no pipeline Target; run intake records Target `full`. |
| Deployment intake | Partly constrained: ladder DEV → SIT → UAT; FRD-02 definition of done names DEV and SIT only. This is a delivery constraint, not a complete deployment-intake answer. | absent | FRD-02 §13; BRD-01 §8; TDD-01 §7. Approval policy and strategy for later UAT/production remain owned downstream decisions (carried from FRD-01 baseline). |

## Executive Summary

FRD-02 adds Google OpenID Connect sign-in and sign-out to the already-deployed FRD-01 foundation. A new Google account is created on first sign-in with a profile of SRS-AUTH-02 defaults; a server-side session with a 30-day idle timeout is established; changing requests are CSRF-protected; a per-session rate limit replaces the FRD-01 per-IP limit for signed-in users; and a repository owner-scope helper is introduced so that every later journal-data query is scoped to a user. The signed-out shell, Dialog, health/readiness, security headers, migration mechanism, and same-image promotion are preserved and extended additively. The technical stack, boundaries, and quality gates are mandated by TDD-01 and the project `AGENTS.md`, not chosen here. Profile editing, demo journals, Google Sheets authorization, and account deletion are explicitly out of scope.

**Readiness summary:** Ready for Architecture; the remaining gaps are named, owned decisions (identity/email rules, pre-session rate-limit key, owner-scope test surface, cookie flags, data-access mechanism) that do not block architecture of the mandated boundary.

## Business Context and Success Measures

- **Business problem and outcome** — A person signs in with a Google account, stays signed in, and signs out; every later feature knows who the person is and keeps each person's data apart (FRD-02 §1, BG-04). Status: Confirmed.
- **Business value** — New users are created without a new password; returning users are recognised; personal data is private; the identity and owner-scope primitives are available to all later FRDs. Status: Confirmed.
- **Success measures** — Functional acceptance AC-02-01 to AC-02-14 and non-functional acceptance NAC-02-01 to NAC-02-07, all executed in tests (FRD-02 §9–10, §13). Status: Confirmed.
- **Product-level context** — Privacy goal BG-04 (own data, export, deletion, no AI share without approval) and tone principles in BRD-01 §4 govern all auth copy and behaviour. Status: Confirmed.
- **Schedule and budget** — No fixed deadline, milestone, or budget constraint known; carried forward unchanged from the FRD-01 PO clarification (2026-11-21). Status: Confirmed (prior answer; not re-asked).
- **Regulatory, residency and classification exposure** — None beyond the supplied BRD/SRS/TDD requirements; carried forward from the FRD-01 PO clarification. Google identity data (subject ID, email, display name, IANA time zone) is personal data handled under NFR-SEC/PRIV, not a newly introduced regulated class. This is not a compliance certification. Status: Confirmed (prior answer; not re-asked).

## Stakeholders, Users, Roles and Personas

- **Product Owner (PO)** — owns requirements, business disputes, UAT/go-live acceptance, and Google OAuth client registration per environment (TDD-OI-02). Status: Confirmed.
- **Journal user** — adult training at a gym or home; signs in with a Google account; uses a phone during workouts and phone or laptop otherwise; wants no new password, persistent phone sign-in, sign-out on shared devices, and only their own data (FRD-02 §4; BRD-01 §3). Status: Confirmed.
- **Demo visitor** — prospective user of a sample journal; "Try a demo journal"/"Try the demo" stays inactive in FRD-02 (FRD-36). Status: Confirmed.
- **No administrator or social-user role** — no administrator users, social features, sharing, or leaderboards in this release (BRD-01 §3, §5.2). Status: Confirmed.
- **Developer, QA, Security, DevOps, Operations** — consumers of this baseline; see Handoff Contract. Status: Confirmed.

## Scope

### In Scope

- Google OpenID Connect authorization-code flow with PKCE, `state`, `nonce`, and scopes `openid email profile` (FRD-02 §2.1, FR-02-01; TDD-01 §4). Status: Mandated.
- Callback verification of `state`, `nonce`, ID-token signature, issuer, audience, and expiry, with a safe failure message and no session on failure (FR-02-02). Status: Mandated.
- First sign-in account and profile creation with SRS-AUTH-02 defaults; later sign-in reuses the existing user without overwriting the OpenGym display name (FR-02-03, FR-02-04). Status: Mandated.
- Server-side sessions, 30-day idle timeout with expiry extension on each request, session cookie per NFR-SEC-02, and sign-out that deletes the server session and clears the cookie (FR-02-05, FR-02-06, FR-02-08). Status: Mandated.
- `GET /api/v1/me`, CSRF protection on changing requests, client route protection with return-to-route, and the five named API endpoints (FR-02-07, FR-02-09, FR-02-10; §8). Status: Mandated.
- Stub sign-in provider for automated tests in DEV and SIT, with a fail-closed startup check when `AUTH_TEST_PROVIDER=true` and `APP_ENV` is `uat` or `prod` (FR-02-11; TDD-01 §4). Status: Mandated.
- Repository owner-scope helper requiring a user ID on every journal-data query, with a unit test proving a query without it fails (FR-02-12, NFR-SEC-01). Status: Mandated.
- Header avatar (first letter of display name) linking to `/settings`, and a minimal `/settings` page showing display name, email, and Sign Out (FR-02-13; §7). Status: Confirmed.
- Additive changes to FRD-01 shared files: route table/route guard, API module registration, and Drizzle/schema index (§11). Status: Mandated.

### Out of Scope

- Profile editing (FRD-03), demo journals (FRD-36), Google Sheets authorization (FRD-34), and account deletion (FRD-35). Status: Confirmed (FRD-02 §2.2).
- Activation of dark theme or alternate accents: `profiles.theme=light` and `accent=peach` are stored defaults only; visual activation is deferred (FRD-07) and FRD-02 §13 forbids changing TDD-01 rules. Status: Confirmed.
- UAT and production deployment: FRD-02 definition of done names DEV and SIT only; real-Google UAT remains later in the ladder. Status: Confirmed (FRD-02 §13; TDD-01 §7).
- Any change to the rules in TDD-01; a feature decision that needs one requires TDD-02, not a local exception. Status: Mandated (TDD-01 introduction; FRD-02 §13).

### Future Scope

- Journal, workout, nutrition, recovery, persona, quest, AI-coach, export, Sheets, demo, and account-deletion capabilities in BRD-01/SRS-01 are delivered by later FRDs and must use the session user and owner-scope helper (FRD-02 §11). Status: Deferred; owner: Product Owner and later FRD owners.

## Current State

Brownfield: FRD-01 is implemented and deployed to DEV and SIT. The following is the observed implementation, with file:line evidence, and the changes FRD-02 must make additively.

- **API assembly** — `createApp()` registers plugins in order `requestId → securityHeaders → errors → database → rateLimit`, then declares routes inline at literal `/api/v1/...` paths (`apps/api/src/app.ts:33-37`, `apps/api/src/app.ts:39-56`). There is no `modules/` directory, Fastify prefix, or auth/session/csrf plugin; FRD-02 adds them within this boundary. Status: Confirmed (observed).
- **Error envelope** — `{ error: { code, message, fields? } }` with `VALIDATION_FAILED` → 400 and `RATE_LIMIT_EXCEEDED` → 429 handled centrally; all other errors fall through to Fastify's default (`apps/api/src/plugins/errors.ts:27-48`; `packages/shared/src/index.ts:4-18`). No `401`/`UNAUTHORIZED`/`CSRF_INVALID` mapping exists in code today; FRD-02 must add it. Status: Confirmed (observed).
- **Rate limiting** — `@fastify/rate-limit`, `max: 300`, `timeWindow: "1 minute"`, `keyGenerator: request.ip`; the 301st request returns 429 (`apps/api/src/plugins/rate-limit.ts:5-8,20-23`; `apps/api/src/app.test.ts:102-125`). No session identity exists to key on; FRD-02 changes the key to the session for signed-in requests. Status: Confirmed (observed).
- **Request ID and logging** — `onRequest` creates a UUID, sets `x-request-id` and a `request_id` log field (`apps/api/src/plugins/request-id.ts:4-10`); the logger is Fastify/pino with no `user_id`, route, status, duration fields and no redaction (`apps/api/src/app.ts:29-31`; `apps/api/src/app.test.ts:148-170`). FRD-02 must add `user_id` when signed in and redact session IDs and tokens. Status: Confirmed (observed).
- **Security headers** — `nosniff` and a restrictive CSP on every response; HSTS only when `APP_ENV === "sit"` (`apps/api/src/plugins/security-headers.ts:4-13`). No change needed for cookie attributes, which are set per session. Status: Confirmed (observed).
- **Data and migrations** — migrations are hand-written SQL files discovered lexicographically by timestamp prefix and applied via `pg` (`apps/api/src/db/migrate.ts:21-36`; `apps/api/src/plugins/database.ts:10-26`). `users` has `id UUID` (custom `uuidv7()` function), `email TEXT NOT NULL UNIQUE`, `display_name TEXT NOT NULL`, `time_zone TEXT NOT NULL`, `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`, `is_demo BOOLEAN NOT NULL DEFAULT false` (`apps/api/src/db/migrations/20261121000000_create_users.sql:7-25`). No Drizzle schema, schema index, repository layer, `sessions`, `user_identities`, or `profiles` exists. Status: Confirmed (observed).
- **Documented-vs-implemented deviation** — TDD-01 §1/§3.2 mandates Drizzle ORM, but FRD-01 shipped raw SQL over `pg` with no Drizzle dependency (`apps/api/package.json:14-22`); FRD-02 must extend the mechanism that exists and have Architecture decide reconciliation inside TDD-01, not silently switch tools. Status: Open – Non-blocking; owner: Architect + Data; target: feature ADR/TDD.
- **Shared contracts** — `packages/shared/src/index.ts` exports only `ApiErrorEnvelopeSchema`, `FoundationValidationInputSchema`, and `ApiErrorEnvelope` (`packages/shared/src/index.ts:4-18`). No auth, session, CSRF, user, or `/me` schemas exist; FRD-02 adds them. Status: Confirmed (observed).
- **Web shell** — `BrowserRouter` renders `ShellNavigation` outside `<Routes>` and six routes plus a not-found fallback (`apps/web/src/app.tsx:10-47`); there is no auth provider, context, or route guard (`apps/web/src/main.tsx:6-12`). Status: Confirmed (observed).
- **Welcome buttons** — rendered as **"Sign in with Google"** and **"Try the demo"**, both inert with `aria-disabled="true"` and `tabIndex={-1}` (`apps/web/src/features/welcome/WelcomeScreen.tsx:45-60`; e2e asserts "present but not clickable" in `e2e/tests/welcome.spec.ts:25-27`). SRS-AUTH-05 and FRD-02 §7 require the active label **"Continue with Google"** and "Try a demo journal"; the implemented label is stale and must change. Status: Confirmed (observed discrepancy; requirement is authoritative).
- **Navigation/avatar** — `ShellNavigation` has desktop/mobile link arrays and no avatar or account control (`apps/web/src/components/ShellNavigation.tsx:6-44`); FRD-02 adds the avatar entry to `/settings`. Status: Confirmed (observed).
- **Environment configuration** — `APP_ENV` is read only by the security-header plugin (`apps/api/src/plugins/security-headers.ts:11`); `AUTH_TEST_PROVIDER`, `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OIDC_REDIRECT_URI` exist only in docs. `docker-compose.yml` has only `db`/`api`/`web` and `.env.example` has only port/Postgres variables; no stub provider container exists yet. Status: Confirmed (observed).
- **Test conventions** — Vitest + Fastify `inject` with `ready()`/`close()`, real PostgreSQL with per-process isolated databases and free ports (`apps/api/src/app.test.ts:17-25,209-218`; `apps/api/test/setup.ts:13-63`; `scripts/test-runner.mjs:10-61`); Playwright + axe for UI (`e2e/playwright.config.ts`, `e2e/tests/welcome.spec.ts:33-44`). The AC-ID-in-test-name rule (TDD-01 §188) and the free-port rule (TDD-01 §191) are not yet reflected in all current test names/config; FRD-02 tests must follow the TDD rules. Status: Confirmed (observed).

## User Journeys and Business Workflows

- **JRN-001: First-time sign-in** — A person with a Google account never used by OpenGym opens a protected route, is sent to `/`, selects "Continue with Google", completes Google consent, and on callback a user and profile with SRS-AUTH-02 defaults are created; the person lands on the route they asked for, or `/today`. Status: Confirmed.
- **JRN-002: Returning sign-in** — An existing user signs in again; the existing user is reused, a changed Google display name does not overwrite the OpenGym display name, and the session cookie is set. Status: Confirmed.
- **JRN-003: Staying signed in** — A signed-in user makes requests over up to 30 days; each request extends the expiry; a protected route works and `/` redirects to `/today`. Status: Confirmed.
- **JRN-004: Sign-out** — A signed-in user selects "Sign Out" in `/settings`; the server session is deleted, the cookie cleared, and the person goes to `/`; the old cookie then returns 401. Status: Confirmed.
- **JRN-005: Failed sign-in** — A callback with a wrong `state` (or other failed check) shows "We could not sign you in. Please try again." with a "Try again" action and creates no session. Status: Confirmed.
- **JRN-006: Protected-route recovery** — A signed-out user opens `/fuel`; the client sends them to `/` and, after sign-in, returns them to `/fuel`. Status: Confirmed.
- **JRN-007: Automated test sign-in** — In DEV/SIT with `AUTH_TEST_PROVIDER=true`, automated tests drive the stub provider through the same flow; in `uat`/`prod` the API refuses to start with that setting. Status: Confirmed.
- **JRN-008: Owner-scoped data access (enabling)** — A later FRD queries journal data through the shared helper with the session user ID; a query without a user ID fails and a cross-user read returns 404. Status: Confirmed.

## Functional Requirements

| ID | Requirement | Source | Stakeholder | Journey | Acceptance Criterion | Status |
| --- | --- | --- | --- | --- | --- | --- |
| FR-02-01 | "Continue with Google" starts the authorization-code flow with PKCE, `state`, `nonce`, and scopes `openid email profile`. | FRD-02 §5 FR-02-01; TDD-01 §4 | Journal user | JRN-001 | AC-02-01 (flow initiated from welcome) | Mandated |
| FR-02-02 | The callback checks `state`, `nonce`, ID-token signature, issuer, audience, and expiry; a failed check shows "We could not sign you in. Please try again." and creates no session. | FRD-02 §5 FR-02-02; §7 | Journal user / Security | JRN-005 | AC-02-04 | Mandated |
| FR-02-03 | First sign-in of a Google subject creates a user with Google display name, email, browser time zone, and SRS-AUTH-02 defaults. | FRD-02 §5 FR-02-03; SRS-AUTH-02 | Journal user / Data | JRN-001 | AC-02-01 | Mandated |
| FR-02-04 | Later sign-in reuses the existing user by subject; a changed Google display name does not overwrite the OpenGym display name. | FRD-02 §5 FR-02-04 | Journal user | JRN-002 | AC-02-02, AC-02-03 | Mandated |
| FR-02-05 | After sign-in, create a session and set the NFR-SEC-02 cookie; route to the requested protected route or `/today`. | FRD-02 §5 FR-02-05; SRS-NAV-03 | Journal user / Security | JRN-001 | AC-02-01, AC-02-11, NAC-02-01 | Mandated |
| FR-02-06 | A session expires after 30 days idle; each request moves the expiry forward. | FRD-02 §5 FR-02-06; SRS-AUTH-03 | Journal user / Security | JRN-003 | AC-02-07, AC-02-08 | Mandated |
| FR-02-07 | `GET /api/v1/me` returns the signed-in user's ID, display name, email, and time zone, or 401. | FRD-02 §5 FR-02-07; §8 | Journal user | JRN-003 | AC-02-05, AC-02-06 | Mandated |
| FR-02-08 | Sign-out deletes the server session, clears the cookie, and goes to `/`. | FRD-02 §5 FR-02-08; SRS-AUTH-04 | Journal user / Security | JRN-004 | AC-02-09 | Mandated |
| FR-02-09 | Every changing request (POST/PUT/PATCH/DELETE) requires a valid CSRF token or returns 403 `CSRF_INVALID`. | FRD-02 §5 FR-02-09; TDD-01 §4 | Security | JRN-004 | AC-02-10 | Mandated |
| FR-02-10 | The client sends a signed-out person to `/` for any protected route and returns them after sign-in; a signed-in person opening `/` goes to `/today`. | FRD-02 §5 FR-02-10; SRS-NAV-03 | Journal user | JRN-001, JRN-006 | AC-02-11, AC-02-12 | Mandated |
| FR-02-11 | With `AUTH_TEST_PROVIDER=true`, sign-in works against the stub; the API refuses to start when this is true and `APP_ENV` is `uat` or `prod`. | FRD-02 §5 FR-02-11; §12; TDD-01 §4 | QA / Security | JRN-007 | AC-02-13 | Mandated |
| FR-02-12 | The repository helper requires a user ID for every journal-data query; a unit test proves a query without it fails. | FRD-02 §5 FR-02-12; TDD-01 §3.2 | Data / Security | JRN-008 | NAC-02-02; AC-02-05 (me scope) | Mandated |
| FR-02-13 | The header shows an avatar with the first letter of the display name, opening `/settings`; a minimal `/settings` shows display name, email, and "Sign Out". | FRD-02 §5 FR-02-13; §7 | Journal user / UX | JRN-004 | AC-02-14 | Confirmed |
| FR-02-14 | The per-person rate limit (NFR-SEC-06) is keyed on the session rather than source IP for signed-in requests. | FRD-02 §2.1; §10 NAC-02-03; TDD-01 §4 | Security / Operations | JRN-003 | NAC-02-03 | Mandated |

## Reference Scenarios

Every concrete worked example the source gives is captured here with its source, distinct from the abstract rule in the FR table. These IDs are cited by `developer` and `comprehensive-qa-suite`.

| ID | Actors | Trigger / Input | Expected Observable Outcome | Source |
| --- | --- | --- | --- | --- |
| RS-001 | New journal user | A Google account that never used OpenGym signs in | A user and profile with SRS-AUTH-02 defaults are created; the person sees `/today`. | FRD-02 AC-02-01 |
| RS-002 | Returning journal user | An existing user signs in again | No second user is created. | FRD-02 AC-02-02 |
| RS-003 | Returning journal user | Existing user changed OpenGym display name; Google now returns a different name | OpenGym display name does not change. | FRD-02 AC-02-03 |
| RS-004 | Journal user / callback | The callback has a wrong `state` | No session is created and the "We could not sign you in. Please try again." message shows. | FRD-02 AC-02-04 |
| RS-005 | Signed-in journal user | Calls `GET /api/v1/me` | Receives own ID, display name, email, and time zone. | FRD-02 AC-02-05 |
| RS-006 | Signed-out caller | Calls `GET /api/v1/me` | Receives 401. | FRD-02 AC-02-06 |
| RS-007 | Journal user | Session last used 30 days and 1 minute ago; makes a request | Receives 401 and the client goes to `/`. | FRD-02 AC-02-07 |
| RS-008 | Journal user | Session last used 29 days ago; makes a request | Request works and expiry moves forward. | FRD-02 AC-02-08 |
| RS-009 | Signed-in journal user | Signs out, then reuses old cookie | Session row deleted; request with old cookie gets 401. | FRD-02 AC-02-09 |
| RS-010 | Signed-in journal user | Sends a POST without a CSRF token | Receives 403 `CSRF_INVALID`. | FRD-02 AC-02-10 |
| RS-011 | Signed-out user | Opens `/fuel` | Goes to `/`; after sign-in goes to `/fuel`. | FRD-02 AC-02-11 |
| RS-012 | Signed-in user | Opens `/` | Goes to `/today`. | FRD-02 AC-02-12 |
| RS-013 | Operator / QA | `APP_ENV=uat` and `AUTH_TEST_PROVIDER=true`; API starts | API stops with an error naming the setting. | FRD-02 AC-02-13 |
| RS-014 | Signed-in user named "Alex Morgan" | Looks at the header | Avatar shows "A" and opens `/settings`. | FRD-02 AC-02-14 |
| RS-015 | QA in SIT | Real Google account, one manual sign-in/out check (needs TDD-OI-02) | Sign-in and sign-out both succeed against real Google. | FRD-02 §12 |

## Business Rules

| ID | Rule | Source | Status |
| --- | --- | --- | --- |
| BR-02-01 | A Google subject ID identifies a returning account; email and display name are not the identity key. | FRD-02 §5 FR-02-03/04; §6 | Mandated |
| BR-02-02 | `user_identities.subject` is unique per provider (`google`). | FRD-02 §6 | Mandated |
| BR-02-03 | First-sign-in profile defaults are fixed: `weight_unit=kg`, `kcal_target=2500`, `protein_target_g=160`, `carbs_target_g=300`, `fat_target_g=70`, `theme=light`, `accent=peach`, `training_goal=''`. | FRD-02 §6; SRS-AUTH-02 | Mandated |
| BR-02-04 | A session ID is 256-bit random and is never logged. | FRD-02 §6; NFR-PRIV-01 | Mandated |
| BR-02-05 | A session expires after 30 days of no request; any request resets the idle window. | FRD-02 §5 FR-02-06; SRS-AUTH-03 | Mandated |
| BR-02-06 | Changing requests require a valid CSRF token; failure is 403 `CSRF_INVALID`. | FRD-02 §5 FR-02-09 | Mandated |
| BR-02-07 | `AUTH_TEST_PROVIDER=true` is permitted only in DEV and SIT; when true in `uat` or `prod` the API must refuse to start. | FRD-02 §5 FR-02-11; TDD-01 §4 | Mandated |
| BR-02-08 | Every journal-data query must be scoped to a user ID; cross-user reads return 404. | FRD-02 §5 FR-02-12; SRS NFR-SEC-01; TDD-01 §3.2 | Mandated |
| BR-02-09 | The prototype is a visual reference only; listed defects PD-01–PD-06 are not acceptable behaviour. | BRD-01 §7 | Mandated |
| BR-02-10 | Later FRDs must use the session user and owner-scope helper for every journal-data query. | FRD-02 §11 | Mandated |

## Data Requirements

- **New `user_identities` table** — columns `user_id`, `provider` (`google`), `subject` (unique per provider), `email`, `created_at`; links a Google identity to the existing `users` row. Status: Mandated.
- **New `sessions` table** — columns `id` (random 256-bit), `user_id`, `created_at`, `last_seen_at`, `expires_at`, `user_agent`; server-side session store with idle expiry. Status: Mandated.
- **New `profiles` table** — one row per user with the BR-02-03 defaults; extends the FRD-01 `users` row without replacing it. Status: Mandated.
- **Existing `users` table** — FRD-01 created `users` with UUID v7 ID, unique `email`, `display_name`, IANA `time_zone`, `created_at`, `is_demo` default false (`20261121000000_create_users.sql:18-25`); FRD-02 must create users on first sign-in without breaking these constraints, and must decide how a Google-supplied email interacts with the unique email column (see DEC-002). Status: Mandated, with one Open – Non-blocking decision.
- **Migration mechanism** — new changes use timestamp-prefixed SQL migrations applied before the new API version; no schema push, no unsafe rollback (`migrate.ts:21-36`; NFR-OPS-003). Status: Mandated.
- **Primary keys and ownership** — UUID v7 primary keys; every journal-data table carries non-null `user_id` with FK to `users.id` and `ON DELETE CASCADE` (TDD-01 §3.2). Status: Mandated.
- **Timestamps and time zone** — timestamps stored UTC; browser IANA time zone captured at first sign-in and stored in the profile; journal day derivation remains a later-FRD concern (NFR-DATA-01; TDD-01 §3.4). Status: Mandated.
- **Data classification** — Google subject ID, email, display name, and time zone are personal data; no new regulated class beyond the standing NFR-SEC/NFR-PRIV set. Status: Confirmed.
- **Retention, archival, backup, RPO/RTO** — no targets supplied for this increment; carried from FRD-01 baseline. Status: Open – Non-blocking; owner: Product Owner + Operations; target: before production release.
- **Owner-scope helper contract** — a shared repository helper that takes `userId` as its first parameter and filters every journal-data query on it; proved by a unit test that omits it (NAC-02-02). Status: Mandated.

## Integration Requirements

- **Google OpenID Connect (external)** — authorization-code flow with PKCE, `state`, `nonce`, scopes `openid email profile`; callback validates signature, issuer, audience, and expiry (FR-02-01/02; TDD-01 §4). Integration owner: Product Owner holds the Google OAuth client registration per environment (TDD-OI-02). Status: Mandated.
- **Google OAuth client registration (TDD-OI-02)** — required for the SIT real-Google manual check (FRD-02 §12) and for UAT real Google sign-in; not present in the repository today. Status: Dependency; owner: Product Owner; needed by FRD-02 SIT verification.
- **Stub OpenID provider (test integration)** — a local stub container in DEV/SIT enabled by `AUTH_TEST_PROVIDER=true`; must be added to the Compose test setup (none exists today). Status: Mandated; owner: Development + DevOps.
- **Incremental Google Sheets scope** — not requested in FRD-02; Sheets authorization is FRD-34. Status: Out of scope.
- **Anthropic AI service** — not invoked by FRD-02. Status: Not Applicable to this FRD.
- **Integration contracts** — new shared Zod schemas for the five API endpoints and error codes in upper snake case with the established envelope (`packages/shared/src/index.ts`; TDD-01 §3.1). Status: Mandated.
- **Single-origin API access** — browser calls only `/api/v1` under the same origin; only the API holds database and Google client credentials (TDD-01 §3, §7.1). Status: Mandated.

## UI/UX and Accessibility Requirements

- **Channels and responsive shell** — responsive web, top navigation ≥768 px and bottom navigation <768 px, from 360 px to 1440 px with no horizontal scroll (SRS-NAV-01, NFR-UX-001). Status: Mandated.
- **Welcome screen** — "Continue with Google" becomes active with a loading state during sign-in; "Try a demo journal"/"Try the demo" stays inactive; a sign-in error message with a "Try again" action appears on failure (FRD-02 §7). Status: Confirmed.
- **Settings screen** — minimal `/settings` with the copy "Your account — Make it yours.", display name, email, and "Sign Out" (FRD-02 §7). No profile editing (FRD-03). Status: Confirmed.
- **Header avatar** — first letter of the display name, linking to `/settings` (FR-02-13, AC-02-14). Status: Confirmed.
- **Visual language** — light warm-Peach contract using CSS Modules and `design-system/opengym/tokens.css` only; no raw token literals; dark theme/alternate accents not activated. Status: Mandated.
- **Accessibility** — WCAG 2.2 AA and zero axe-core level-A/AA violations on the welcome screen and `/settings`; keyboard operable; 44×44 CSS-px mobile targets; Dialog focus trap/return retained (NFR-A11Y-01/02/03; TDD-01 §6). Status: Mandated.
- **Localisation and browsers** — English only; latest two versions of Chrome, Edge, Firefox, Safari on desktop and mobile (NFR-UX-02). Status: Mandated.
- **UX decisions still open** — detailed layout and interaction design for the sign-in loading/error states, avatar, and minimal settings are for UX within the UI Design intake answer (see Run Configuration Answers; contested). Status: Open – Non-blocking; owner: UX; target: UI Design stage.

## Security, Privacy and Compliance Requirements

| ID | Requirement | Driver (regulation / policy / risk) | Evidence Needed | Status |
| --- | --- | --- | --- | --- |
| SEC-001 | Session cookie is `HttpOnly`, `Secure` in SIT, `SameSite=Lax`. | FRD-02 NFR-SEC-02; SRS NFR-SEC-02 | API response-header/cookie test (NAC-02-01) | Mandated |
| SEC-002 | Every journal-data query is limited to the signed-in user's own records; cross-user read returns 404; a query without `user_id` fails. | BR-24; FRD-02 NFR-SEC-01; SRS NFR-SEC-01; TDD-01 §3.2 | Owner-scope unit test (NAC-02-02) + cross-user API test | Mandated |
| SEC-003 | Changing requests carry a valid CSRF token; failure is 403 `CSRF_INVALID` (double-submit token in readable cookie, `X-CSRF-Token` header). | FRD-02 NFR-SEC-02/FR-02-09; TDD-01 §4 | API CSRF test (AC-02-10) | Mandated |
| SEC-004 | Callback validates `state`, `nonce`, signature, issuer, audience, and expiry; failed validation creates no session. | FRD-02 FR-02-02; OIDC threat (spoofing/ replay) | Callback negative tests (AC-02-04) | Mandated |
| SEC-005 | Per-person rate limit keyed on session; 301st request in one minute from one session returns 429; API refuses to start with `AUTH_TEST_PROVIDER=true` in `uat`/`prod`. | FRD-02 NFR-SEC-06, FR-02-11; TDD-01 §4 | API rate-limit and startup-guard tests (NAC-02-03, AC-02-13) | Mandated |
| SEC-006 | Logs contain no session ID, ID token, or access token; log privacy extends to journal content, photos, notes, AI prompts/answers. | FRD-02 NFR-PRIV-01; SRS NFR-PRIV-01; TDD-01 §10 | Log-capture test (NAC-02-04) + pino redaction config review | Mandated |
| SEC-007 | OWASP ASVS 4.0 Level 1 authentication and session checks (V2, V3) pass. | FRD-02 NFR-SEC-07; SRS NFR-SEC-07 | Security review report (NAC-02-05) | Mandated |
| SEC-008 | Secrets (`GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`) come from environment configuration only; never committed or logged. | FRD-02 NFR-SEC-05; SRS NFR-SEC-05 | Config review + CI secret scan | Mandated |
| SEC-009 | Server-side validation of all API input against shared Zod schemas; invalid input returns 400 with field errors; security headers (CSP, `nosniff`, SIT HSTS) retained. | FRD-02 dependencies on FRD-01; SRS NFR-SEC-03/04 | API tests + response-header tests | Mandated |
| SEC-010 | Session ID is random 256-bit; sessions deleted on sign-out and expired sessions rejected. | FRD-02 §6; AC-02-07/09 | Session lifecycle API tests | Mandated |
| SEC-011 | Threat model for the OAuth callback and session boundary is documented in the feature ADR (STRIDE), extending ADR-001. | Governance baseline; ADR-001 threat model precedent | Feature ADR security review | Mandated |
| SEC-012 | No new regulatory, data-residency, or classification constraint is introduced by FRD-02 beyond supplied requirements; this is not a compliance certification. | FRD-01 PO clarification carried forward | Traceable PO clarification; re-review if processing changes | Confirmed |

## Non-Functional Requirements

IDs are the canonical NFR codes from the source documents and are kept stable. Every measurable NFR carries a metric, target, measurement point, workload/condition, validation method, environment, and owner.

| ID | Metric | Target | Measurement Point | Workload / Condition | Validation Method | Environment | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-SEC-02 | Session cookie attributes | `HttpOnly`, `Secure` (SIT), `SameSite=Lax` on the session cookie | `Set-Cookie` on session-creating response | Sign-in flow in SIT | API test (NAC-02-01) | SIT CI | Development + Security | Mandated |
| NFR-SEC-01 | Owner-scope enforcement | Query without `user_id` fails; cross-user read returns 404 | Repository helper + protected API | Unit and API test with a second user | Unit test (NAC-02-02) + cross-user API test | DEV/SIT CI | Development + Security | Mandated |
| NFR-SEC-06 | Per-person rate limit | 301st request in one minute from one session returns 429 | Rate-limit plugin keyed on session | One session, one minute | API test (NAC-02-03) | DEV/SIT CI | Development + Security | Mandated |
| NFR-PRIV-01 | Log redaction | Zero log lines contain a session ID, ID token, or access token | Emitted pino log stream | Sign-in, callback, sign-out, error paths | Log-capture test (NAC-02-04) | DEV/SIT CI | Development + Security | Mandated |
| NFR-SEC-07 | OWASP ASVS L1 V2/V3 | All applicable authentication/session checks pass | Security review of auth flow | Full sign-in/session flow | Security review report (NAC-02-05) | SIT | Security | Mandated |
| NFR-PERF-01 | `GET /api/v1/me` p95 latency | ≤ 300 ms at 50 concurrent users, 1 year of data per user | API response timing | 50 concurrent users, 1 year data | k6 load test (NAC-02-06) | SIT | Development + QA | Mandated |
| NFR-A11Y-01 | Automated accessibility | Zero axe-core level-A/AA violations on welcome screen and `/settings` | Rendered pages | Light theme, mobile and desktop viewports | Playwright + axe (NAC-02-07) | CI | UX + QA | Mandated |
| NFR-SEC-05 | Secret exposure | Zero secrets found in source; secrets from environment only | Source and CI config | Every integration commit | CI secret scan + config review | CI | Development + Security | Mandated |
| NFR-A11Y-02 | Keyboard operation | All new controls operable by keyboard; Dialog focus trap/return preserved | Browser interaction | Changed screens | Playwright keyboard test | CI | UX + QA | Mandated |
| NFR-A11Y-03 | Touch target | Avatar and settings actions ≥ 44 × 44 CSS px | Rendered mobile UI | Narrow viewport | Playwright measurement | CI | UX + QA | Mandated |
| NFR-UX-001 | Responsive layout | No horizontal scroll at 360, 768, 1440 px | Rendered pages | Light theme | Playwright | CI | UX + QA | Mandated |
| NFR-PERF-004 | Largest Contentful Paint | ≤ 2.5 s on the welcome page | Welcome page render | Lighthouse mobile, simulated 4G | Lighthouse CI | CI/SIT | Development + QA | Mandated |
| NFR-OPS-002 | Structured logging | Every log line valid JSON with `request_id` and `user_id` when signed in | API log stream | Authenticated requests | API/log assertion | DEV/SIT CI | Development + Operations | Mandated |
| NFR-OPS-003 | Database change control | All DB changes are versioned timestamp-prefixed migrations | Repository/database | New tables and later change | Migration CI gate | CI/SIT | Development + Data | Mandated |
| NFR-SEC-09 | Dependency vulnerability | Zero known critical/high findings at release | Dependency scan | Every integration commit/release | CI scan | CI | Development + Security | Mandated |

## Architecture-Driving Requirements and Constraints

- **Mandated service boundary** — Browser calls only the same-origin OpenGym API under `/api/v1`; the API alone accesses PostgreSQL and holds the Google client credentials; no direct browser-to-database path. Status: Mandated.
- **Extensibility over reuse of FRD-01** — auth, session, CSRF, rate-limit keying, and owner-scope are added additively; shared-file edits (route table, API module registration, schema index) stay small, as later FRDs depend on them. Status: Mandated.
- **OIDC correctness** — the architecture must provide the state/PKCE/nonce lifecycle and callback validation so the API, not the client, owns identity verification; failure yields no session. Status: Mandated.
- **Session as security principal** — identity, rate-limit keying, log `user_id`, and authorization all derive from the server-side session; the client's display state is not trusted for authorization. Status: Mandated.
- **Data isolation primitive** — a single shared owner-scope helper enforced by type/contract so later journal FRDs cannot omit the user filter; cross-user access returns 404, not 403, to avoid existence disclosure. Status: Mandated.
- **Configuration and fail-closed behaviour** — all secrets and the test-provider switch come from environment variables; the stub must be impossible to enable in `uat`/`prod`. Status: Mandated.
- **Migration safety** — migrations run as a distinct step before the new API version; rollback must account that schema/data rollback may be unsafe after a migration. Status: Mandated for forward migration; Open – Non-blocking for detailed rollback/runbook, owner: Architect + DevOps.
- **Data-access mechanism reconciliation (DEC-004)** — FRD-01 shipped raw SQL over `pg` although TDD-01 mandates Drizzle; the architect must decide how FRD-02 adds schemas consistent with the existing mechanism without silently changing the stack or breaking TDD-01. Status: Open – Non-blocking; owner: Architect + Data; target: feature ADR/TDD.
- **No TDD-01 rule changes** — any feature decision requiring a TDD-01 rule change needs a new TDD-02, not a local exception. Status: Mandated.

## Technology Constraints, Preferences and Open Selections

`Tech Status` uses its own vocabulary: Mandated / Existing constraint / Preferred / Recommended by analysis / Open for architecture decision.

| Area | Item | Tech Status | Driver / Rationale | Decision Owner |
| --- | --- | --- | --- | --- |
| Frontend | TypeScript strict, React 19, Vite 6, React Router, TanStack Query, CSS Modules/tokens | Mandated | TDD-01 §1; AGENTS.md | Architect / Development |
| Backend | Node.js 22 LTS, Fastify 5, Zod shared validation | Mandated | TDD-01 §1; AGENTS.md | Architect / Development |
| Backend | `openid-client` / OIDC library choice, session store keying | Open for architecture decision | TDD-01 §4 mandates OIDC flow but names no library; new runtime dependency requires feature ADR justification. | Architect |
| Data stores | PostgreSQL 16, migration mechanism | Mandated | TDD-01 §1; existing `pg` implementation | Architect / Data |
| Data stores | Drizzle ORM adoption for new tables | Open for architecture decision | TDD-01 §1/§3.2 mandates Drizzle; FRD-01 shipped raw SQL. Reconcile without a TDD-01 rule change. | Architect / Data |
| Integration | Google OpenID Connect (authorization code + PKCE) | Mandated | TDD-01 §4; FRD-02 FR-02-01/02 | Architect / Development |
| Integration | Local stub OIDC provider implementation | Open for architecture decision | TDD-01 §4 requires a stub provider container but names no product. | Architect / DevOps |
| Infrastructure | Docker/Compose, GitLab CI, same-image promotion | Mandated | TDD-01 §7–8; AGENTS.md | DevOps |
| Infrastructure | SIT/UAT container host | Open for architecture decision | TDD-OI-01; shared-VM fallback applies. | Product Owner / DevOps |
| Third-party products | Google Cloud OAuth client / consent configuration | Mandated (integration exists) | TDD-OI-02; registration is a PO-owned dependency. | Product Owner |

## Environment and Infrastructure Requirements

- **DEV** — local/CI; seed and test data; stub provider allowed; local startup via Docker Compose. Status: Mandated.
- **SIT** — system integration after FRD-02; stub provider allowed, real Google allowed; real Google manual check requires TDD-OI-02; k6 and Playwright/axe gates apply. Status: Mandated.
- **UAT** — PO acceptance with real Google sign-in only; `AUTH_TEST_PROVIDER` must be false/absent; FRD-02 does not deploy UAT per its definition of done. Status: Mandated (TDD-01 §7; FR-02-11).
- **Parity and configuration** — same images across environments; configuration from environment variables (`APP_ENV`, `DATABASE_URL`, `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OIDC_REDIRECT_URI`, `PUBLIC_BASE_URL`, `AUTH_TEST_PROVIDER`). Status: Mandated.
- **Stub provider container** — not present today; must be added to the DEV/SIT Compose test setup for `AUTH_TEST_PROVIDER=true`. Status: Mandated; owner: Development + DevOps.
- **SIT host** — shared Linux VM fallback until TDD-OI-01 is resolved. Status: Open – Non-blocking; owner: Product Owner / DevOps.
- **Secret handling** — client secret and session signing key supplied by environment/secret manager; never in repository or logs. Status: Mandated.

## Engineering and Quality Requirements

- **Repository practices** — pnpm workspace root commands, strict TypeScript, linting/formatting follow TDD-01; feature changes additive under `apps/web/src/features/` and `apps/api/src/modules/`; shared-index edits small. Status: Mandated.
- **Shared contracts** — JSON request/response contracts added as Zod schemas in `packages/shared`; upper-snake-case error codes using the established envelope. Status: Mandated.
- **Quality gates** — CI requires zero lint/type errors; ≥80% line coverage in shared/API modules; migration checks against empty and preceding schemas; Playwright/axe, dependency scan, SBOM, and endpoint k6 gates. Status: Mandated.
- **Test isolation** — real PostgreSQL with unique per-process databases and free ports; tests do not depend on execution order and can run concurrently in worktrees (TDD-01 §9). Status: Mandated.
- **AC-ID naming** — every acceptance test name contains its AC/NAC identifier (TDD-01 §188); current tests do not yet fully comply, FRD-02 tests must. Status: Mandated.
- **Dependency discipline** — no second framework/runtime dependency without feature ADR justification (OIDC library, stub provider). Status: Mandated.
- **Documentation** — feature ADR(s) (including STRIDE threat model for the OAuth/session boundary) and feature TDD are repository deliverables under TDD-01. Status: Mandated.
- **Definition of done** — all functional and non-functional ACs pass in executed tests; TDD-01 §8 gates pass; deployed to DEV and SIT with SIT smoke test; feature ADRs and TDD present; no change to TDD-01 rules (FRD-02 §13). Status: Confirmed.

## Testing and Acceptance Strategy

- **Acceptance authority** — Product Owner holds UAT/go-live acceptance and business-dispute authority; analysis gate is answered by the Architect in the IRIS Console. Status: Confirmed.
- **Functional coverage** — execute tests mapped to AC-02-01 … AC-02-14 with criterion IDs in test names; cover both stub-provider automated flow and the callback negative cases. Status: Mandated.
- **NFR coverage** — execute API/cookie/CSRF/rate-limit/log-capture, owner-scope unit and cross-user API, ASVS L1 review, k6 for `GET /me` (NAC-02-06), and Playwright + axe (NAC-02-07). Status: Mandated.
- **Stub provider** — automated tests use the stub provider in DEV/SIT; `@live-ai` pattern has no analogue here — the real-Google check is the single tagged manual SIT check (TDD-OI-02). Status: Mandated.
- **Pre-UAT browser coverage** — Chromium for FRD CI; Chromium, Firefox, WebKit before UAT (TDD-01 §8). Status: Mandated.
- **Test data** — real PostgreSQL, isolated databases, seeded test users; cross-user isolation tests use a second user and expect 404. Status: Mandated.
- **Release evidence** — retain test results, SBOM, vulnerability scan, ASVS review, deployment record, and SIT smoke evidence for PO acceptance. Status: Recommended; owner: QA + DevOps; target: release handoff.
- **Manual SIT check** — one real-Google sign-in/out check in SIT, dependent on Google OAuth client registration (TDD-OI-02). Status: Dependency; owner: Product Owner + QA; needed by SIT verification.

## Delivery, Release and Deployment Requirements

- **Pipeline** — on integration-branch commits, build once, pass gates, produce CycloneDX SBOM, and promote the same web/API tag DEV → SIT. Status: Mandated.
- **Deployment scope** — deploy FRD-02 to DEV and SIT with a passing SIT smoke test; UAT and production are later. Status: Confirmed (FRD-02 §13).
- **Configuration change** — new required environment values (`SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OIDC_REDIRECT_URI`, and `AUTH_TEST_PROVIDER` for DEV/SIT) set through the approved secret mechanism; values never committed. Status: Mandated.
- **Migration ordering** — apply timestamp-prefixed migrations for `user_identities`, `sessions`, `profiles` before the new API version starts. Status: Mandated.
- **Fail-closed startup** — API must refuse to start when `AUTH_TEST_PROVIDER=true` and `APP_ENV` is `uat` or `prod` (AC-02-13). Status: Mandated.
- **Strategy and approvals** — no rolling/blue-green/canary strategy, maintenance window, or release approval policy beyond PO UAT/go-live authority is supplied. Status: Open – Non-blocking; owner: DevOps + Product Owner; target: before production release.
- **Rollback** — detailed rollback and data-rollback limitations not specified; adding identity/session tables can make data rollback unsafe after migration. Status: Open – Non-blocking; owner: Architect + DevOps; target: before first production release.

## Migration and Rollout Requirements

- **Application migration** — no legacy application or user data to migrate; FRD-02 extends the FRD-01 foundation (not a replacement). Status: Not Applicable.
- **Schema migration** — additive timestamp-prefixed migrations create `user_identities`, `sessions`, `profiles` and apply to the FRD-01 `users` schema; verified against empty and preceding schemas. Status: Mandated.
- **User migration** — no existing real accounts to migrate; FRD-01 `users` has no seeded real users. Demo-user creation remains out of scope (FRD-36). Status: Confirmed.
- **Cutover / coexistence** — same-image promotion with migrations run first; no parallel run or user-retraining requirement is stated. Status: Open – Non-blocking; owner: DevOps + Product Owner; target: before production release.
- **Google registration rollout** — OAuth client and redirect URIs must be registered per environment before real-Google sign-in (SIT manual check, UAT). Status: Dependency; owner: Product Owner; needed by FRD-02 SIT verification.

## Operations and Support Requirements

- **Operational signals** — retain `/health`, `/ready`, request-ID logging; add `user_id` to logs when signed in; no session ID/token in logs. Status: Mandated.
- **Monitoring and alerts** — no auth-specific SLO, dashboard, or alert target supplied; existing health/readiness suffice for this increment. Status: Open – Non-blocking; owner: Operations + Product Owner; target: before production release.
- **Operational owner, support hours, runbooks** — not specified; carried from FRD-01 baseline. Status: Open – Non-blocking; owner: Product Owner + Operations; target: before production release.
- **Backup, restore, DR** — no targets supplied for this increment. Status: Open – Non-blocking; owner: Operations + DevOps; target: before production release.
- **Google credential lifecycle** — OAuth client secret rotation and redirect-URI maintenance are operational responsibilities of the PO/Operations; no rotation schedule supplied. Status: Open – Non-blocking; owner: Product Owner + Operations; target: before production release.

## Traceability Matrix

| Requirement ID | Source | Stakeholder / Owner | Acceptance Criterion | Validation Method | Status |
| --- | --- | --- | --- | --- | --- |
| FR-02-01 | FRD-02 §5; TDD-01 §4 | Journal user / Development | AC-02-01 | E2E stub-provider flow | Mandated |
| FR-02-02 | FRD-02 §5 | Security / Development | AC-02-04 | Callback negative API tests | Mandated |
| FR-02-03 | FRD-02 §5; SRS-AUTH-02 | Data / Development | AC-02-01 | API + DB assertion | Mandated |
| FR-02-04 | FRD-02 §5 | Development | AC-02-02, AC-02-03 | API + DB assertion | Mandated |
| FR-02-05 | FRD-02 §5; SRS-NAV-03 | Security / Development | AC-02-01, AC-02-11, NAC-02-01 | API + E2E | Mandated |
| FR-02-06 | FRD-02 §5; SRS-AUTH-03 | Security / Development | AC-02-07, AC-02-08 | API session-expiry tests | Mandated |
| FR-02-07 | FRD-02 §5; §8 | Development | AC-02-05, AC-02-06 | API test | Mandated |
| FR-02-08 | FRD-02 §5; SRS-AUTH-04 | Security / Development | AC-02-09 | API test | Mandated |
| FR-02-09 | FRD-02 §5; TDD-01 §4 | Security / Development | AC-02-10 | API CSRF test | Mandated |
| FR-02-10 | FRD-02 §5; SRS-NAV-03 | UX / Development | AC-02-11, AC-02-12 | Playwright E2E | Mandated |
| FR-02-11 | FRD-02 §5; TDD-01 §4 | QA / Security | AC-02-13 | API startup-guard test | Mandated |
| FR-02-12 | FRD-02 §5; TDD-01 §3.2 | Data / Security | NAC-02-02 | Unit + cross-user API test | Mandated |
| FR-02-13 | FRD-02 §5; §7 | UX / Development | AC-02-14 | Playwright | Confirmed |
| FR-02-14 | FRD-02 §2.1; NAC-02-03 | Security / Development | NAC-02-03 | API rate-limit test | Mandated |

## Decision Register

| ID | Decision Required | Context and Constraints | Options | Recommendation | Owner | Decision Deadline | Status | Downstream Impact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEC-001 | Reconcile Google email with the unique `users.email` column on first and later sign-in. | FRD-01 `users.email` is `TEXT NOT NULL UNIQUE` (`20261121000000_create_users.sql:20`); identity is by subject, not email (BR-02-01), and FR-02-04 forbids overwriting display name from Google. Source does not state what happens if a Google email collides with an existing row or changes. | (a) Keep first-sign-in email immutable and match only by subject; (b) update stored email from Google on each sign-in; (c) drop/relax the unique constraint. | Keep the email captured at first sign-in immutable and match solely by subject (option a); a subject is stable, avoids a unique-constraint failure, and is consistent with the display-name rule. Raise a TDD/design decision before relaxing any constraint. | Architect + Product Owner | Feature TDD / design stage | Open – Non-blocking | Data model, migration, FR-02-03/04, AC-02-01/02/03 |
| DEC-002 | Define the session-identity-to-email relationship and profile creation transaction on first sign-in. | `users`, `user_identities`, and `profiles` are three tables; first sign-in must create a user and profile atomically (AC-02-01) and never a second user (AC-02-02). | (a) One transaction across all three tables; (b) separate inserts with reconciliation. | Create user, identity, and profile in one transaction keyed by subject. | Architect + Data | Feature TDD / design stage | Open – Non-blocking | Data integrity, FR-02-03/04 |
| DEC-003 | Select the OIDC library and local stub OpenID provider implementation. | TDD-01 §4 mandates the flow and a stub provider but names no product; new runtime dependencies need ADR justification; test provider must be impossible in uat/prod. | (a) Established OIDC library + lightweight local stub; (b) hand-rolled flow + bespoke stub. | Use a well-maintained OIDC client library and the simplest local stub that exercises the full flow; justify both in the feature ADR. | Architect | Feature ADR / design stage | Open – Non-blocking | Integration, security evidence, test tooling |
| DEC-004 | Reconcile Drizzle mandate with the shipped raw-SQL/`pg` mechanism. | TDD-01 §1/§3.2 mandates Drizzle; FRD-01 shipped raw SQL with no Drizzle dependency (`apps/api/package.json`). FRD-02 adds three tables and a schema index. | (a) Extend with timestamp-prefixed raw SQL consistent with FRD-01 and note deviation; (b) introduce Drizzle for new tables alongside existing mechanism; (c) migrate foundation to Drizzle. | Extend additively with timestamp-prefixed SQL consistent with the deployed foundation, keep schema definitions reviewable, and record the deviation for the Architect to reconcile without a TDD-01 rule change. | Architect + Data | Feature ADR / design stage | Open – Non-blocking | Data, migrations, shared schema index |
| DEC-005 | Resolve the UI Design intake answer (contested) and sign-in/settings interaction design. | Source references a prototype but demotes it to visual-only; FRD-02 changes real screens. UI Design intake cannot be confirmed from source. | (a) Treat design as provided from the prototype/reference; (b) generate design for the new states; (c) no design work. | Offer the intake to the human; if none is provided, generate the minimal sign-in/settings design within the light warm-Peach token contract. | Human (UI Design intake) / UX | UI Design gate | Open – Non-blocking | UX, UI, accessibility, welcome/settings screens |
| DEC-006 | Confirm Google OAuth client registration and redirect URIs per environment. | TDD-OI-02 assigns registration to the PO and needs it before FRD-02 in SIT; none exists in the repo. | (a) PO registers before SIT; (b) defer the real-Google check until registered. | PO registers clients and redirect URIs for DEV/SIT before SIT verification; automated tests remain on the stub provider regardless. | Product Owner | Before FRD-02 SIT verification | Open – Non-blocking | Integration, QA manual check, UAT |
| DEC-007 | Define production release/rollback policy and operational model. | Same-image promotion and migration ordering are mandated; production strategy, SLOs, backup/DR, and support model are not supplied. | Rolling/blue-green/canary/manual with agreed approvals and recovery targets. | Architect/DevOps/PO to propose against availability and risk constraints before production. | Architect / DevOps / Product Owner | Before first production release | Open – Non-blocking | Delivery, Operations |
| DEC-008 | Decide whether a logged-in user opening `/auth/google/start` or `/auth/csrf` and the signed-out rate-limit key behaviour need explicit rules. | FRD-02 §2.1 changes the per-person limit to the session; FRD-01 used IP keying; signed-out requests have no session. Source does not state the signed-out key. | (a) Keep IP-based keying for signed-out requests and session-based once signed in; (b) separate buckets per route. | Retain IP-based keying for pre-session requests and switch to session keying once authenticated; document in the feature TDD. | Architect + Security | Feature TDD / design stage | Open – Non-blocking | Security, rate limiting, FR-02-14 |

## Assumption Register

| ID | Assumption | Reason | Validation Owner | Validation Deadline | Impact if Incorrect |
| --- | --- | --- | --- | --- | --- |
| ASM-001 | No new regulatory, residency, or classification constraint beyond supplied requirements. | FRD-01 PO clarification (2026-11-21) carried forward; FRD-02 adds only standard Google identity data. | Product Owner | Analysis gate / before SIT | New obligations would change data handling and evidence requirements. |
| ASM-002 | No fixed deadline or budget constrains FRD-02 scope. | FRD-01 PO clarification carried forward. | Product Owner | Analysis gate | Scope may need reduction if a constraint exists. |
| ASM-003 | Google accounts are available to target users (BRD-01 §8 assumption). | Stated in BRD-01. | Product Owner | Before UAT | Sign-in path unusable for users without Google accounts. |
| ASM-004 | A local stub provider can be run in DEV/SIT Compose to satisfy FR-02-11. | TDD-01 §4 requires it; no container exists today. | Development / DevOps | Before SIT automated tests | Automated auth tests cannot run; SIT verification blocked. |
| ASM-005 | SIT/UAT container host fallback (shared Linux VM) remains available. | TDD-01 §7 and FRD-01 baseline fallback. | DevOps | Before SIT deployment | SIT deployment is blocked until a host is available. |
| ASM-006 | First sign-in email can be stored in the existing unique `users.email` column without colliding in practice. | Users table is empty of real users today. | Architect + Data | Feature TDD | Collisions would cause sign-in failures; see DEC-001. |

## Dependency Register

| ID | Dependency | Type | Owner | Needed By | Status | Impact if Unavailable |
| --- | --- | --- | --- | --- | --- | --- |
| DEP-001 | FRD-01 shell, Dialog, plugins, migration mechanism, same-image promotion | Internal foundation | Development / DevOps | Build start | Confirmed (deployed) | Cannot extend; foundation must be restored first. |
| DEP-002 | Google OAuth client registration and redirect URIs per environment (TDD-OI-02) | External integration | Product Owner | FRD-02 SIT real-Google check | Open | Real-Google SIT manual check and UAT sign-in blocked; automated stub path still works. |
| DEP-003 | Local stub OpenID provider for DEV/SIT | Test tooling | Development / DevOps | Automated auth tests | Open | Automated sign-in tests cannot run. |
| DEP-004 | Secret mechanism for `SESSION_SECRET`, `GOOGLE_CLIENT_SECRET` | Platform / security | DevOps | DEV and SIT deployment | Confirmed (mechanism exists from FRD-01) | Signing/encryption cannot be configured; deployment blocked. |
| DEP-005 | SIT/UAT container host (shared VM fallback) | Infrastructure | DevOps / Product Owner | SIT deployment | Assumed | SIT deployment blocked. |
| DEP-006 | GitLab CI, k6, Playwright+axe, SBOM/dependency scan | Delivery tooling | DevOps / QA | Quality gates | Confirmed (established in FRD-01) | NFR evidence cannot be produced. |

## Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RSK-001 | OIDC callback validation is incomplete (state/nonce/signature/issuer/audience/expiry), allowing session hijack or replay. | Medium | High | Implement all checks in FR-02-02; negative API tests for each; ASVS L1 review (NAC-02-05); ADR threat model. | Development + Security | Mitigated by mandatory controls |
| RSK-002 | Session IDs or tokens leak into logs, violating NFR-PRIV-01. | Medium | High | pino redaction config + log-capture test (NAC-02-04); never log cookie/token values. | Development + Security | Mitigated by mandatory controls |
| RSK-003 | Owner-scope helper is bypassed by a later FRD, causing cross-user data disclosure. | Medium | High | Single enforced helper with unit test (NAC-02-02), cross-user 404 API test, and TDD-01 §3.2 rule (BR-02-10). | Data + Security | Mitigated by mandatory controls |
| RSK-004 | Unique-email collision or email change breaks first/later sign-in. | Medium | Medium | Resolve DEC-001 in design; match by subject; test collision/change cases. | Architect + Data | Open – Non-blocking |
| RSK-005 | `AUTH_TEST_PROVIDER=true` mistakenly enabled in a real environment. | Low | High | Fail-closed startup check (AC-02-13), config review, environment gating in deployment. | DevOps + Security | Mitigated by mandatory control |
| RSK-006 | Google OAuth registration delayed, blocking the SIT real-Google check. | Medium | Medium | Track DEP-002/TDD-OI-02; keep automated tests on stub provider; escalate before SIT. | Product Owner | Open – Non-blocking |
| RSK-007 | Migration/schema rollback unsafe after adding identity/session tables. | Medium | High | Forward-only recovery; run migrations before API start; document rollback limits. | Architect + DevOps | Open – Non-blocking |
| RSK-008 | Drizzle/raw-SQL inconsistency causes rework or a TDD-01 rule breach. | Medium | Medium | Resolve DEC-004 in feature ADR; keep additive timestamp-prefixed migrations; no silent stack change. | Architect + Data | Open – Non-blocking |
| RSK-009 | Prototype-only text or defects copied into the active welcome/settings screens. | Medium | Medium | Treat prototype as visual only; use BRD-01 §7 and FRD-02 §7 copy as authority; QA visual review. | UX + QA | Mitigated |

## Open Questions

### Blocking

None. Every item on the mandatory elicitation list is answered by the supplied sources or carried-forward FRD-01 PO clarifications: the stack is mandated by TDD-01/AGENTS.md; the integration set is Google OIDC plus a local stub with the PO owning registration (TDD-OI-02); no new regulatory/residency/classification exposure; the PO is the acceptance authority; no fixed deadline or budget; acceptance is fully specified by AC-02-01…14 and NAC-02-01…07; and FRD-01 behaviour must be preserved additively. No human question batch is required to proceed to Architecture.

### Non-blocking

- **UI Design intake (DEC-005)** — Human / UX; resolve at the UI Design gate. The requirement references a prototype but does not confirm a design answer.
- **Email/unique-constraint and transaction rules (DEC-001, DEC-002)** — Architect + Product Owner / Data; resolve at feature TDD/design.
- **OIDC library and stub provider selection (DEC-003)** — Architect; resolve in feature ADR.
- **Drizzle vs raw-SQL reconciliation (DEC-004)** — Architect + Data; resolve in feature ADR.
- **Signed-out rate-limit keying (DEC-008)** — Architect + Security; resolve in feature TDD.
- **Google OAuth client registration (DEP-002/TDD-OI-02)** — Product Owner; before SIT verification.
- **Production release, rollback, retention, backup/DR, and operational model (DEC-007)** — Architect / DevOps / Product Owner / Operations; before first production release.

## Readiness Assessment

**Overall rating: Ready for Architecture.** FRD-02 scope, mandated stack and boundaries, functional and non-functional acceptance criteria, data shape, integrations, and current-state evidence are clear. Remaining gaps are named, owned decisions that affect detailed design, deployment, or production operations rather than the safety of designing the mandated auth boundary. One UI Design intake answer is contested and will be offered by the Orchestrator at its gate; it does not block architecture.

| Workstream | Ready / Conditional / Blocked | Evidence | Remaining gap | Owner |
| --- | --- | --- | --- | --- |
| Product and business | Ready | FRD-02 goals, stories, in/out scope, PO authority, no deadline/budget | None material to FRD-02 | Product Owner |
| UX | Conditional | Concrete welcome/settings copy and avatar rule; prototype reference | UI Design intake contested; detailed sign-in/error states (DEC-005) | Human / UX |
| Architecture | Ready | Mandated stack/boundaries, OIDC/data/session drivers, current-state evidence | OIDC library, stub, Drizzle reconciliation, email rules, rate-limit keying (DEC-001–004, DEC-008) | Architect |
| Data | Conditional | Three-table shape, defaults, migration mechanism, ownership rule | Email/unique-constraint and transaction decisions (DEC-001/002/004) | Architect + Data |
| Security | Ready | Cookie/CSRF/OIDC/session/owner-scope/rate-limit/redaction/ASVS requirements with evidence | Signed-out rate-limit keying (DEC-008); ADR threat model | Security + Architect |
| Development | Ready | FR-02-01…14, RS-001…015, API endpoints, additive constraints | Implementation choices in DEC-003/004 | Development |
| QA | Ready | AC/NAC mappings, stub-provider strategy, NFR validation methods | Google registration for manual SIT check (DEP-002) | QA + Product Owner |
| Infrastructure and DevOps | Conditional | Docker/CI/promotion, env config names, fail-closed rule | Stub container, secret config, SIT host, Google registration (DEP-002/003/005) | DevOps / Product Owner |
| Migration | Conditional | Additive timestamp-prefixed migrations; no legacy data | Final migration design after DEC-001/002/004 | Data / Development |
| Operations | Conditional | Health/readiness/logging retained; `user_id` logging added | SLOs, runbooks, backup/DR, credential rotation before production | Operations / Product Owner |

## Delivery Workstreams and Todo List

- **Business analysis** — maintain FRD boundaries and PO acceptance evidence; carry later product scope to subsequent FRDs.
- **UX** — resolve the UI Design intake and produce the light warm-Peach sign-in/error/settings/avatar contract; verify responsive, keyboard, focus, and 44 px targets.
- **Architecture** — produce feature ADR(s) and TDD within TDD-01; resolve DEC-001–004 and DEC-008; include STRIDE threat model for the OAuth/session boundary.
- **Security** — verify cookie, CSRF, OIDC callback validation, owner scope, redaction, rate limiting, and ASVS L1 evidence.
- **Data** — design the three additive tables and migrations; resolve email/unique and transaction decisions; prove owner-scope helper.
- **Development** — implement FR-02-01…14 and RS-001…015 additively; add shared Zod schemas and API endpoints; keep shared edits small.
- **Testing** — map and execute AC-02/NAC-02 tests with IDs in names; stub-provider automation, cross-user isolation, k6, Playwright+axe; support concurrent isolated runs.
- **DevOps** — add stub provider and secret config, apply migrations before API start, promote the same tag DEV→SIT, smoke-check SIT, enforce fail-closed startup.
- **Migration** — validate additive migrations against empty and preceding schemas; forward-only recovery.
- **Operations** — define production SLOs, runbooks, backup/DR, and credential rotation before production scope.

## Handoff Contract

- **Product / BA** — receives scope (FRD-02 §2), journeys JRN-001…008, FR-02-01…14, business rules BR-02-01…10, RS-001…015, and acceptance authority; owns DEC-001 email rule input and DEC-006 Google registration.
- **UX** — receives welcome/settings/avatar requirements, accessibility targets, prototype limitations, and the contested UI Design intake to be offered at its gate.
- **Architect** — receives architecture drivers, mandated stack/boundaries, current-state file:line evidence, data and integration needs, and open decisions DEC-001–004 and DEC-008; must not change TDD-01 rules.
- **Security** — receives SEC-001…012, NFR-SEC/PRIV targets and evidence requirements, OIDC/session threat areas, and the ADR STRIDE obligation.
- **Developer** — receives confirmed behaviour (FR IDs), reference scenarios RS-001…015, API endpoints and shared-contract expectations, additive-change constraints, and the Definition of Done.
- **QA** — receives traceable AC-02/NAC-02 criteria, NFR table with measurable targets and validation methods, stub-provider test strategy, environment expectations, and the manual real-Google SIT check dependency.
- **DevOps** — receives environment ladder and config names, migration ordering, fail-closed startup, same-image promotion, stub-provider/secret requirements, and unresolved host/release decisions.
- **Operations** — receives retained health/readiness/logging requirements, `user_id` logging, and explicit production-readiness gaps to close before production.
