# Feature Decomposition: OpenGym FRD-02 Google Sign-In and Sign-Out

**Format version:** 1
**Requirement:** docs/requirement/frd-02-google-sign-in.md

## Summary

This increment adds Google OpenID Connect sign-in and sign-out additively to the deployed FRD-01 foundation. It covers the shared auth contracts and error codes, the three timestamp-prefixed additive tables and the enforced owner-scope helper, the server-side session/CSRF/rate-limit/account API boundary, the pinned `openid-client` callback and atomic first-sign-in identity transaction, the DEV/SIT stub provider with its fail-closed startup guard, the web welcome/settings screens with route guard and avatar, and the DEV/SIT quality gates and manual promotion evidence. FRD-01's shell, five placeholders, health/readiness endpoints, migration mechanism and same-tag promotion are preserved; no TDD-01 rule is changed and no IRIS deployment plan is created (deployment mode is `manual`).

## Source Documents

- `docs/requirement/frd-02-google-sign-in.md` (Analysis gate approved 2026-11-25) — FR-02-01…14, RS-001…015, AC-02-01…14, NAC-02-01…07, SEC-001…012, BR-02-01…10, Decision Register.
- `docs/design/frd-02-google-sign-in.md` (Design gate approved 2026-11-26) — TDD, API interface (five endpoints), data model, NFR table, testing strategy, manual rollout notes, codebase discovery findings.
- `docs/adrs/002-google-oidc-sign-in-boundary.md` — pinned `openid-client`, callback validation, STRIDE threat model, self-service registration review.
- `docs/adrs/003-first-sign-in-identity-and-profile-transaction.md` — subject-keyed identity, atomic three-table first sign-in, immutable OpenGym-owned values, email-collision fail-closed.
- `docs/adrs/004-data-access-mechanism-reconciliation.md` — raw SQL over `pg`, additive migrations, no Drizzle/second ORM, parameterized and owner-scoped queries.
- `docs/adrs/005-session-csrf-rate-limit-and-authorization-principal.md` — session principal, cookie attributes, double-submit CSRF, hybrid rate-limit keying, log redaction, owner-scope enforcement.
- `docs/adrs/006-local-stub-oidc-provider.md` — purpose-built DEV/SIT stub container, real signed ID tokens, fail-closed guard, no production topology change.
- `docs/design/ui-inventory.md` (UI Design gate approved 2026-11-26) — FRD-01 SCR-1…SCR-7/CMP-1…CMP-9 retained; FRD-02 SCR-1 states, SCR-8, CMP-10…CMP-14, `## Codebase Discovery Findings`.
- `docs/design/ui-contract.md` — warm-Peach token contract, exact FRD-02 copy, token path discrepancy, craft bindings.
- `docs/design/mockup/welcome-sign-in.html`, `docs/design/mockup/settings.html` — visual references for SCR-1 and SCR-8.
- `docs/source/TDD-01.md` — frozen binding authority for stack, boundaries, auth flow, quality gates and the no-local-exception rule.
- `.iris/runs/frd-02-google-sign-in-and-20261125/inputs/FRD-02-google-sign-in.md` — original FRD-02 requirement (byte-for-byte persisted input).
- `docs/decomposition/01-app-foundation.md` — prior increment (CAP-1…CAP-5); identifiers here continue at CAP-6.
- Overlapping baseline specs cross-checked: `openspec/specs/web-shell/spec.md` and `openspec/specs/api-foundation/spec.md`; no active OpenSpec changes and no `docs/design/contracts/` directory exist.

## Brainstorm Notes

**Core goal:** give the deployed FRD-01 foundation a single, reusable identity and authorization primitive — Google sign-in, a server-side session, CSRF, a per-session rate limit and an owner-scoped repository helper — plus the welcome/settings UI and the DEV/SIT test tooling that proves it, without touching a TDD-01 rule.

**Codebase findings (grounded, not guessed):** the shipped API registers `requestId → securityHeaders → errors → database → rateLimit` and declares routes inline (`apps/api/src/app.ts:33-56`); there is no `modules/`, auth/session/CSRF plugin, `/me`, or 401/`CSRF_INVALID` error mapping. Data access is hand-written parameterized SQL over a `pg.Pool` with lexicographically applied `*.sql` migrations (`apps/api/src/plugins/database.ts`, `apps/api/src/db/migrate.ts`); only `20261121000000_create_users.sql` exists and there is no Drizzle dependency. The welcome buttons are stale-labelled and inert (`WelcomeScreen.tsx:45-60`), `ShellNavigation` has no avatar, the token file actually imported is `apps/web/src/styles/tokens.css` (the `design-system/opengym/tokens.css` prose path does not resolve), the Playwright `webServer` points at a non-existent `dist/server.mjs`, and no stub provider container or `AUTH_TEST_PROVIDER` config exists. These observations come from the TDD and UI inventory `## Codebase Discovery Findings` sections.

**Resolved from approved documents (no human question needed):**
- Data access stays on raw SQL over `pg` with three additive timestamp-prefixed migrations; no Drizzle, no second ORM, no edit to the `users` migration (ADR-004 / DEC-004 option a). The TDD-01 Drizzle text remains an owned drift item for TDD-02; this increment does not change it.
- Identity verification uses one pinned `openid-client`; the API alone verifies state, nonce, PKCE, signature, issuer, audience and expiry and holds the Google credentials (ADR-002).
- Automated sign-in uses a small purpose-built stub OIDC container in DEV/SIT Compose, with a fail-closed startup guard for `uat`/`prod` (ADR-006).
- First sign-in inserts `users`, `user_identities` and `profiles` in one transaction keyed by `(provider, subject)`; `users.email` and `users.display_name` are immutable, a changed Google email lives only in `user_identities.email`, and an email collision fails closed (ADR-003).
- Deployment is `manual`: the team promotes the same web/API tags with a distinct migration-first step; no ladder/target/strategy record or deployment plan is produced here. RS-015 (one real-Google SIT check) remains PO-registration-dependent (DEP-002) and is never a dependency of the automated suite.
- UI work is additive under `apps/web/src/features/auth/`; only small additions to the route table and `ShellNavigation` are allowed. Exact copy comes from FRD-02 §7 and the UI contract; SCR-2…SCR-7 and CMP-1…CMP-9 are retained unchanged.

**Overlapping-scenario cross-check (explicit resolution):** `openspec/specs/web-shell/spec.md` records "Google action has no side effect" for the FRD-01 signed-out foundation. FRD-02 intentionally *activates* that control as "Continue with Google" (FR-02-01, AC-02-01, SCR-1/CMP-10) while keeping the demo action inert. This is an approved additive extension of the same screen, recorded as an observed discrepancy in the baseline `## Current State` and in both TDD/UI discovery sections — not a retraction of an FRD-01 capability. It is decomposed as new CAP-6…CAP-12 capabilities; no earlier identifier, scenario or increment is restated. The FRD-01 `api-foundation` spec proves only a 429 status, not the error body; CAP-6/CAP-8 add the `RATE_LIMIT_EXCEEDED` body assertion required by ADR-005 without retracting that scenario. Signed-out IP keying is retained, with session keying added only after a session resolves (DEC-008).

**Out of scope:** profile editing (FRD-03), demo journals (FRD-36), Google Sheets (FRD-34), account deletion (FRD-35), dark theme/alternate accents (FRD-07), Anthropic, journal-data feature modules, UAT/production deployment, any TDD-01 rule change, and production rollout/SLO/retention/runbook targets.

**Owned open items (not invented here):** DEP-002 Google OAuth client registration for the RS-015 manual check; TDD-02 reconciliation of the Drizzle text; production rollback policy, auth SLO, monitoring, retention, backup/DR and credential rotation.

---

## CAP-6 — Shared Auth Contracts and Error Mapping Extensions

**Depends on:** none (foundation capability over the deployed FRD-01 shared package)
**Owning service:** Shared
**Satisfies:** FR-02-07, FR-02-09, AC-02-10, RS-006, RS-010
**Governed by:** ADR-002, ADR-005
**Domain:** `auth-contracts`

### Summary
Append the Zod request/response schemas for the five auth endpoints and the new upper-snake-case error codes to the existing shared package, and correct the rate-limit error-body contract. This capability defines shapes only; it enforces no runtime behavior and implements no UI.

### Requirements (ADDED)

- **Requirement: One shared contract for every auth endpoint**
  - `packages/shared` SHALL export Zod schemas for `/auth/google/start` (`returnTo` allowlist), `/auth/google/callback` (`code`, `state`, `iss?`), `/me` (`id`, `displayName`, `email`, `timeZone`), `/auth/csrf` (`csrfToken`) and sign-out, plus an additive error-code block, using a small append-only edit to `packages/shared/src/index.ts`.
  - Scenario: Shared `/me` shape
    - **WHEN** the web client and the API validate a signed-in `/me` response
    - **THEN** both use the same shared `{ id, displayName, email, timeZone }` Zod schema and an unknown `returnTo` fails schema validation.
- **Requirement: Complete error envelope mapping contract**
  - The established `{ error: { code, message, fields? } }` envelope SHALL carry `UNAUTHORIZED` (401), `CSRF_INVALID` (403), `NOT_FOUND` (404) and `RATE_LIMIT_EXCEEDED` (429) alongside the existing codes.
  - Scenario: CSRF failure shape
    - **WHEN** a changing request is rejected for a missing or invalid CSRF token
    - **THEN** the response body is `{ error: { code: "CSRF_INVALID", message: ... } }` with no session or token detail.
  - Scenario: Rate-limit body is proven
    - **WHEN** the 301st request inside one minute is rejected
    - **THEN** the response body carries `error.code = "RATE_LIMIT_EXCEEDED"` in the standard envelope, not only a 429 status.

### Requirement Coverage
TDD "API interface" and "Data Model / API Changes" (`docs/design/frd-02-google-sign-in.md:96-149`) define the five endpoint contracts and the new error codes; ADR-005 `:19` requires the 429 body be proven; requirement baseline `SEC-009` requires shared Zod validation and the established envelope.

### Evidence
Shared-package schema tests; injected API tests asserting the 401/403/404/429 bodies; review that `packages/shared/src/index.ts` gained only an additive export block and still imports no app code.

### Demonstrates Reference Scenarios
RS-006 (401 body for signed-out `/me`) and RS-010 (403 `CSRF_INVALID` body) at the contract level; both are driven to observable responses by CAP-8. No UI inventory screen is implemented here.

### NFRs
- NFR-SEC-03 — server-side validation of all input against shared Zod schemas.

### Constraints
- Append to `packages/shared/src/index.ts`; do not rewrite the FRD-01 exports.
- Error codes remain strings in the shared package to keep the edit small.
- No new runtime dependency and no browser-to-API import inversion.

### Assumptions
- The FRD-01 error envelope shape stays unchanged.

### Contracts / Interfaces
Defines the shared Zod schemas and error codes consumed by CAP-8 (API), CAP-9 (OIDC start/callback) and CAP-11 (web client).

### API Surface (indicative)
Shapes for `GET /auth/google/start`, `GET /auth/google/callback`, `POST /auth/sign-out`, `GET /me`, `GET /auth/csrf`.

### Data owned
None.

### Events published
None.

### Events consumed
None.

### Implementation Notes
TDD `## Codebase Discovery Findings` notes the shipped rate-limit test asserts only status 429; add the body assertion here rather than relying on the framework default.

### Out of scope for this capability
- Runtime enforcement, cookie handling, UI components, database access.

---

## CAP-7 — Additive Identity, Session and Profile Schema with Enforced Owner Scope

**Depends on:** none (additive over the deployed FRD-01 migration mechanism)
**Owning service:** API
**Satisfies:** FR-02-03, FR-02-12, AC-02-05, NAC-02-02, RS-008, SEC-002
**Governed by:** ADR-003, ADR-004, ADR-005
**Domain:** `auth-data-foundation`

### Summary
Create `user_identities`, `sessions` and `profiles` with three versioned SQL migrations and introduce the single parameterized repository helper that makes `userId` a mandatory first argument for every journal-data query. No identity resolution or session lifecycle code lives here.

### Requirements (ADDED)

- **Requirement: Three additive, versioned tables**
  - The API database area SHALL contain timestamp-prefixed SQL files, applied in filename order after `20261121000000_create_users.sql`, creating `user_identities` (`id UUID` via `uuidv7()`, `user_id` FK `ON DELETE CASCADE`, `provider` checked to `google`, `subject`, `email`, `created_at`, `UNIQUE (provider, subject)`, index on `user_id`), `sessions` (`id TEXT PRIMARY KEY` for a 256-bit base64url token, `user_id` FK `ON DELETE CASCADE`, `created_at`, `last_seen_at`, `expires_at`, `user_agent`, indexes on `user_id` and `expires_at`) and `profiles` (`user_id UUID PRIMARY KEY` FK `ON DELETE CASCADE`, authoritative `time_zone`, and the fixed BR-02-03 defaults including `theme='light'`, `accent='peach'`, `weight_unit='kg'`, `kcal_target=2500`, `protein_target_g=160`, `carbs_target_g=300`, `fat_target_g=70`, `training_goal=''`).
  - Scenario: Empty and preceding-schema migration
    - **WHEN** the three migrations run against an empty PostgreSQL 16 database and against the FRD-01 preceding schema
    - **THEN** all three tables exist with the stated constraints and indexes, and `20261121000000_create_users.sql` is unchanged.
  - Scenario: Idempotence-safe forward application
    - **WHEN** a migration is replayed by the non-transactional shipped runner
    - **THEN** `IF NOT EXISTS` guards prevent a partial or duplicate schema and recovery is forward-only.
- **Requirement: Raw-SQL parameterized repository boundary**
  - All data access for these tables SHALL use parameterized queries over the existing `pg.Pool`; no Drizzle dependency, no drizzle-kit, no second ORM, no schema push, and no new authority for the token/theme file.
  - Scenario: No second data-access mechanism
    - **WHEN** the API manifest and database code are inspected
    - **THEN** no ORM dependency is present and every new query is parameterized.
- **Requirement: Mandatory owner-scope helper**
  - A single shared repository helper SHALL take `userId` as its first parameter and apply the `user_id` predicate to every journal-data query; a query that omits it SHALL fail before execution and a cross-user read SHALL return 404 `NOT_FOUND`.
  - Scenario: Omitted owner (NAC-02-02)
    - **WHEN** a repository call omits the `userId` argument
    - **THEN** it throws and no SQL is executed.
  - Scenario: Cross-user isolation
    - **WHEN** a signed-in user requests a record owned by a second seeded user
    - **THEN** the API returns 404 `NOT_FOUND`, not 403, and discloses no existence information.

### Requirement Coverage
TDD "Data access and migrations (ADR-004)" and "Owner-scope authorization" (`:84-90`); requirement baseline Data Requirements (`:159-170`) and `NFR-SEC-01`; ADR-003 `:13-17` (subject key and BR-02-03 defaults); ADR-004 `:13-17`; ADR-005 `:21`.

### Evidence
Migration CI output against empty and preceding schemas; unit test proving a query without `user_id` fails; API test with a second seeded user proving 404; manifest/database inspection for the no-second-ORM constraint.

### Demonstrates Reference Scenarios
RS-008 (owner-scoped data access enabling: a query without a user ID fails and a cross-user read returns 404). No UI inventory screen is implemented here; owner scope is the data primitive later screens depend on.

### NFRs
- NFR-OPS-003 — every database change is a versioned `YYYYMMDDHHMMSS_*.sql` migration.
- NFR-SEC-01 — owner-scope enforcement and cross-user 404.

### Constraints
- Reuse the shipped `uuidv7()` function; do not edit or rewrite the users migration.
- Migrations run as a distinct deployer-owned step before the new API version; the API process does not self-migrate.
- `userId` is the first parameter of every journal-data repository function, enforced by type/contract.

### Assumptions
- The shipped runner applies files lexicographically and the deployer verifies the three tables exist before starting the API.

### Contracts / Interfaces
Defines the three table schemas, an additive schema index file (no Drizzle schema) and the `ownerScope(userId, ...)` repository helper signature consumed by CAP-8, CAP-9 and every later journal FRD.

### API Surface (indicative)
None; this capability owns the data boundary beneath the endpoints.

### Data owned
`user_identities`, `sessions`, `profiles` and the additive schema index file.

### Events published
None.

### Events consumed
Database connectivity from the FRD-01 `pg.Pool` plugin.

### Implementation Notes
ADR-004 `:32` records that the shipped migration runner is non-transactional; keep each migration individually idempotence-safe and verify before API start. Cross-user reads are a 404, never a 403 (ADR-005).

### Out of scope for this capability
- First-sign-in identity resolution, the three-table transaction, session creation/expiry code, journal-data modules, and any change to the `users` schema or unique-email constraint.

---

## CAP-8 — Server-Side Session Principal, CSRF, Rate-Limit Keying and Account API

**Depends on:** CAP-6, CAP-7
**Owning service:** API
**Satisfies:** FR-02-05, FR-02-06, FR-02-07, FR-02-08, FR-02-09, FR-02-14, AC-02-05, AC-02-06, AC-02-07, AC-02-08, AC-02-09, AC-02-10, NAC-02-01, NAC-02-03, NAC-02-04, SEC-001, SEC-003, SEC-005, SEC-006, SEC-010
**Governed by:** ADR-005
**Domain:** `session-security`

### Summary
Implement the server-side session as the authorization principal, the NFR-SEC-02 cookie, double-submit CSRF, hybrid `300/minute` rate-limit keying, structured/redacted logging, and the three non-OIDC API endpoints: `GET /me`, `GET /auth/csrf`, `POST /auth/sign-out`.

### Requirements (ADDED)

- **Requirement: Session cookie and 30-day idle timeout**
  - The API SHALL create a 256-bit random session ID stored base64url-encoded in `sessions.id`, set it in an `HttpOnly`, `SameSite=Lax`, `Secure`-in-SIT cookie, reject a missing or expired row with 401 `UNAUTHORIZED`, and move `expires_at` to 30 days from each protected request. The raw value SHALL never be logged or placed in a URL.
  - Scenario: Cookie attributes (NAC-02-01)
    - **WHEN** a session-creating response is returned in SIT
    - **THEN** its `Set-Cookie` is `HttpOnly`, `SameSite=Lax` and `Secure`, and no raw session ID appears in a log line or redirect URL.
  - Scenario: Idle expiry (RS-007)
    - **WHEN** a session was last used 30 days and 1 minute ago and a protected request arrives
    - **THEN** the API returns 401 `UNAUTHORIZED` and the client is sent to `/`.
  - Scenario: Idle extension (AC-02-08, RS-008)
    - **WHEN** a session was last used 29 days ago and a protected request arrives
    - **THEN** the request succeeds and `expires_at` moves 30 days forward from that request.
- **Requirement: Signed-in account read**
  - `GET /api/v1/me` SHALL return the session user's own `id`, `displayName`, `email` and `timeZone`, or 401 when no valid session resolves.
  - Scenario: Own record (RS-005)
    - **WHEN** a signed-in caller requests `/api/v1/me`
    - **THEN** the API returns 200 with only that user's four fields.
  - Scenario: No session (RS-006)
    - **WHEN** a signed-out caller requests `/api/v1/me`
    - **THEN** the API returns 401 with `error.code = "UNAUTHORIZED"`.
- **Requirement: Double-submit CSRF on changing requests**
  - `GET /api/v1/auth/csrf` SHALL return `{ csrfToken }` and set a readable `XSRF-TOKEN` cookie holding an HMAC of the session ID with `SESSION_SECRET`; every POST/PUT/PATCH/DELETE, including sign-out, SHALL require a matching `X-CSRF-Token`, and failure SHALL be 403 `CSRF_INVALID` through the central handler. The HMAC reveals no session ID and needs no new session column.
  - Scenario: Valid token refresh
    - **WHEN** a signed-in caller requests `/auth/csrf`
    - **THEN** the response carries a token matching the readable cookie and no session ID is exposed.
  - Scenario: Missing token (RS-010)
    - **WHEN** a signed-in caller sends a POST without a valid `X-CSRF-Token`
    - **THEN** the API returns 403 with `error.code = "CSRF_INVALID"` and no state change occurs.
- **Requirement: Immediately effective sign-out**
  - `POST /api/v1/auth/sign-out` SHALL delete the server session row and clear the cookie on a valid CSRF token, returning 204; a reused old cookie SHALL then return 401.
  - Scenario: Old cookie after sign-out (RS-009)
    - **WHEN** a signed-in user signs out and replays the previous session cookie
    - **THEN** the row is gone and the replayed request returns 401 `UNAUTHORIZED`.
- **Requirement: Hybrid rate-limit keying and proxy trust**
  - The general `300/minute` limit SHALL be retained; signed-out requests SHALL key on source IP and requests with a resolved session SHALL key on the session identity. `trustProxy` SHALL trust only the single documented nginx hop so a forwarded client IP changes the signed-out bucket, while forwarded headers from any other source are ignored.
  - Scenario: Session-keyed boundary (NAC-02-03)
    - **WHEN** one session makes its 301st general API request inside one minute
    - **THEN** the API returns 429 with `error.code = "RATE_LIMIT_EXCEEDED"`.
  - Scenario: Trusted single hop
    - **WHEN** a signed-out request arrives through nginx with a different forwarded client IP
    - **THEN** that client uses its own bucket and a directly supplied `X-Forwarded-For` from any other source does not.
- **Requirement: Principal-aware, redacted structured logging**
  - The request-ID plugin SHALL add `user_id` once a session resolves, and pino redaction SHALL cover the session ID, ID token, access token and transient auth cookie.
  - Scenario: No secret in logs (NAC-02-04)
    - **WHEN** sign-in, callback, sign-out and error paths emit logs
    - **THEN** every line is valid JSON with `request_id` and `user_id` when signed in, and zero lines contain a session ID, ID token, access token or transient auth cookie.

### Requirement Coverage
TDD "Session as the security principal", "CSRF", "Rate limiting", "API interface" (`:72-106`), ADR-005 `:13-21`, requirement baseline `SEC-001…SEC-006`, `SEC-010`, NFR-SEC-02/01/06, NFR-PRIV-01, NFR-OPS-002.

### Evidence
Fastify `inject` tests with a real isolated PostgreSQL database and free ports; cookie/header assertions; log-capture test; rate-limit boundary at 301 with a body assertion; proxy-trust test; trustProxy config review.

### Demonstrates Reference Scenarios
RS-005, RS-006, RS-007, RS-008 (idle-extension aspect), RS-009, RS-010. No UI inventory screen is implemented here; CAP-11 renders these responses in SCR-1/SCR-8.

### NFRs
- NFR-SEC-02 — cookie attributes on the session-creating response.
- NFR-SEC-06 — 301st request per session returns the documented 429 body.
- NFR-PRIV-01 — zero session IDs/tokens in emitted logs.
- NFR-OPS-002 — JSON logs with `request_id` and `user_id` when signed in.
- NFR-SEC-07 — OWASP ASVS L1 V2/V3 checks (evidence assembled by CAP-12).

### Constraints
- Register new plugins after `rateLimit` without reordering `app.ts:33-37`; keep the one-line module registration additive.
- No JWT session: revocation must be a row deletion. No new session column for CSRF.
- `SESSION_SECRET` from environment only; never commit or log it.

### Assumptions
- A single nginx hop fronts the API; `SESSION_SECRET` is provisioned in DEV/SIT.
- CAP-9 uses the session-create contract defined here when a callback succeeds.

### Contracts / Interfaces
Consumes the CAP-6 error codes/schemas and CAP-7 `sessions` table and helper; provides the session-create/resolve contract and the three account endpoints to CAP-9 and CAP-11.

### API Surface (indicative)
`GET /api/v1/me`; `GET /api/v1/auth/csrf`; `POST /api/v1/auth/sign-out`.

### Data owned
`sessions` row lifecycle (schema from CAP-7); no new columns or tables.

### Events published
None.

### Events consumed
Session cookie, CSRF token from the readable cookie, proxy hop metadata.

### Implementation Notes
Keep the FRD-01 300/minute limit and health/readiness/security-header plugins intact. A deterministic HMAC CSRF token is not a secret to log; key rotation invalidates outstanding tokens and the client re-fetches (ADR-005 `:37`). Signed-in callers opening `/auth/csrf` or `/auth/google/start` start a safe/idempotent GET with no CSRF requirement (DEC-008).

### Out of scope for this capability
- OIDC start/callback, identity/profile creation, the stub provider, UI components, journal-data modules, and any change to the general rate-limit value or existing plugin order.

---

## CAP-9 — Google OIDC Sign-In Boundary and Atomic First-Sign-In Identity

**Depends on:** CAP-6, CAP-7, CAP-8
**Owning service:** API
**Satisfies:** FR-02-01, FR-02-02, FR-02-03, FR-02-04, FR-02-05, AC-02-01…AC-02-04, RS-001…RS-004, SEC-004, SEC-008, SEC-011
**Governed by:** ADR-002, ADR-003, ADR-004
**Domain:** `google-oidc-sign-in`

### Summary
Implement `GET /auth/google/start` and `GET /auth/google/callback` with one pinned `openid-client`, the signed transient auth cookie, complete callback validation, and the single-transaction identity/profile creation that reuses an existing user by Google subject.

### Requirements (ADDED)

- **Requirement: Server-side authorization-code start with PKCE**
  - The API SHALL use one pinned version of `openid-client` for discovery and build the authorization URL with `S256` PKCE, a random `state`, a random `nonce` and scopes `openid email profile`; it SHALL store `state`, `nonce`, verifier, allowlisted `returnTo` and a 10-minute expiry in a signed, HttpOnly, `SameSite=Lax` transient cookie derived from `SESSION_SECRET` and redirect 302 to the IdP. An unknown `returnTo` SHALL return 400 `VALIDATION_FAILED`.
  - Scenario: Flow initiated from welcome (AC-02-01)
    - **WHEN** a signed-out visitor activates "Continue with Google" with a known `returnTo`
    - **THEN** the API 302s to the IdP with PKCE/`state`/`nonce` and sets the short-lived transient cookie.
  - Scenario: Unknown return target
    - **WHEN** `returnTo` is not one of `/today`, `/train`, `/fuel`, `/coach`, `/grow`, `/settings`
    - **THEN** the API returns 400 `VALIDATION_FAILED` and sets no auth cookie.
- **Requirement: Complete callback verification, fail closed**
  - The callback SHALL exchange the code with the stored verifier and validate ID-token signature, `iss`, `aud`, `exp`, `state` and `nonce`; any failed check SHALL create no session and no session cookie, redirect to `/?auth_error=1`, and put no token, email or exception detail in the URL or logs.
  - Scenario: Wrong state (RS-004)
    - **WHEN** the callback carries a `state` that does not match the transient cookie
    - **THEN** no session row or cookie is created, the visitor is redirected to `/?auth_error=1`, and the welcome screen can show "We could not sign you in. Please try again."
  - Scenario: Each ID-token check
    - **WHEN** signature, issuer, audience, expiry, nonce or PKCE validation fails
    - **THEN** the same no-session, generic-error outcome occurs and no claim value is logged.
- **Requirement: Atomic first sign-in and subject-keyed returning sign-in**
  - On a valid callback the API SHALL resolve `(provider='google', subject)`; on first sign-in it SHALL insert the `users` row (Google display name, Google email, browser IANA time zone into both `users.time_zone` and `profiles.time_zone`), the `user_identities` row and the `profiles` row with the BR-02-03 defaults in **one database transaction**, then create the CAP-8 session and redirect to the allowlisted `returnTo` or `/today`. On later sign-ins it SHALL reuse the existing user and profile without overwriting OpenGym-owned `users.display_name`, `users.email` or stored profile defaults; a changed Google email SHALL be stored only in `user_identities.email`.
  - Scenario: New Google subject (RS-001)
    - **WHEN** a Google account never used by OpenGym completes the callback
    - **THEN** one user, one identity and one profile with the SRS-AUTH-02 defaults are committed atomically and the visitor lands on the requested protected route or `/today`.
  - Scenario: Returning subject (RS-002)
    - **WHEN** an existing subject signs in again
    - **THEN** no second user is created and a session cookie is set.
  - Scenario: Changed Google display name (RS-003)
    - **WHEN** Google returns a different display name for a returning subject
    - **THEN** `users.display_name` and every stored profile default remain unchanged.
  - Scenario: Email collision fails closed
    - **WHEN** a first sign-in's Google email already exists in `users` under a different subject
    - **THEN** no session, cookie or partial row is left, the generic sign-in error is shown, and no email value is logged; the unique constraint is not relaxed.

### Requirement Coverage
TDD "Sign-in flow" (`:63-70`) and "API interface" (`:100-106`); ADR-002 `:32-34` (pinned library, API-owned verification, fail closed) and its STRIDE table; ADR-003 `:13-17`; ADR-004 `:15-17` (one transaction over parameterized raw SQL); requirement baseline BR-02-01…BR-02-03, SEC-004, SEC-011, RS-001…RS-004.

### Evidence
Injected callback tests for every negative check (state, nonce, signature, issuer, audience, expiry, PKCE); DB assertions for atomicity/idempotence and unchanged OpenGym values; transient-cookie TTL test; allowlist test; ASVS evidence assembled by CAP-12.

### Demonstrates Reference Scenarios
RS-001, RS-002, RS-003, RS-004. Backend counterpart of SCR-1 (CMP-10 trigger, CMP-11 error copy); the components themselves are implemented in CAP-11.

### NFRs
- NFR-SEC-07 — authentication/session checks pass the ASVS L1 V2/V3 review.
- NFR-PRIV-01 — no ID token, access token, email or callback detail in logs or URLs.
- NFR-SEC-05 — Google credentials from environment only.

### Constraints
- Pin the exact `openid-client` version when added; it must not float; no second OIDC/JWT framework.
- The API, never the browser, verifies the identity and holds `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OIDC_REDIRECT_URI` and `SESSION_SECRET`.
- Do not relax `users.email` UNIQUE and do not merge accounts by email; a future change needs TDD-02 or a human-approved design change.

### Assumptions
- Automated tests use the ADR-006 stub; real Google sign-in (RS-015) depends on PO registration (DEP-002) and is never a prerequisite for these tests.
- CAP-8 exposes the session-create contract used after the transaction commits.

### Contracts / Interfaces
Consumes CAP-6 start/callback schemas and error codes, CAP-7 tables, and the CAP-8 session-create contract; provides the redirect/error contract consumed by CAP-11 and the same-origin flow exercised by CAP-10.

### API Surface (indicative)
`GET /api/v1/auth/google/start`; `GET /api/v1/auth/google/callback`.

### Data owned
The first-sign-in `users`/`user_identities`/`profiles` transaction and the transient auth cookie.

### Events published
None.

### Events consumed
Google authorization code and signed ID token; transient auth cookie.

### Implementation Notes
ADR-002's STRIDE table and registration review are binding: Google's token proves identity only; authorization stays with CAP-8 and CAP-7. No session exists until the three-table transaction commits (ADR-003). Keep callback failures generic to avoid account enumeration and token leakage.

### Out of scope for this capability
- The stub provider container and fail-closed startup guard (CAP-10), welcome/settings UI (CAP-11), profile editing, demo journal, Google Sheets, and any change to a TDD-01 rule.

---

## CAP-10 — DEV/SIT Stub OIDC Provider, Fail-Closed Guard and Test Topology

**Depends on:** CAP-6
**Owning service:** Delivery
**Satisfies:** FR-02-11, AC-02-13, RS-013, BR-02-07, SEC-005, DEP-003
**Governed by:** ADR-006
**Domain:** `stub-oidc-test-provider`

### Summary
Add a small purpose-built stub OpenID provider to the DEV and SIT Compose stacks and the API startup guard that refuses `AUTH_TEST_PROVIDER=true` in `uat`/`prod`. This is a test-stack addition only; it changes no production topology and produces no deployment plan.

### Requirements (ADDED)

- **Requirement: Purpose-built stub IdP in DEV/SIT**
  - The DEV and SIT Compose stacks SHALL include a stub OIDC service exposing an authorize endpoint with a sign-in form, a token endpoint and a JWKS endpoint, issuing real signed ID tokens with configured issuer, audience, `sub`, `email` and `name` so the ADR-002 validation path runs unchanged. Test signing keys SHALL be generated inside the container and never committed; the service SHALL receive no `DATABASE_URL`, Google client credentials or `SESSION_SECRET`, and its image SHALL be pinned or promoted with the same release tag and never added to a UAT/production stack.
  - Scenario: Stub-driven sign-in
    - **WHEN** `AUTH_TEST_PROVIDER=true` in DEV or SIT and an automated test activates sign-in
    - **THEN** the stub issues a signed ID token and the unchanged CAP-9 callback validates it and creates a session.
- **Requirement: Fail-closed startup guard**
  - The API SHALL validate configuration at startup and refuse to start with an error naming `AUTH_TEST_PROVIDER` when that flag is true and `APP_ENV` is `uat` or `prod`.
  - Scenario: Guard in a real environment (AC-02-13, RS-013)
    - **WHEN** the API starts with `APP_ENV=uat` and `AUTH_TEST_PROVIDER=true`
    - **THEN** it stops with an error naming `AUTH_TEST_PROVIDER` and starts no listener.
- **Requirement: Runnable, isolated E2E entry**
  - The Playwright harness SHALL start a working static web server (replacing the non-existent `dist/server.mjs` entry), use isolated databases and free ports, name every new test with its AC/NAC identifier, and tag and clean up its own test-created data.
  - Scenario: E2E harness boots
    - **WHEN** Playwright starts its web server in a concurrent worktree
    - **THEN** the welcome and settings tests run on an isolated origin/without shared database or port collisions.

### Requirement Coverage
TDD "Stub provider (FR-02-11, ADR-006)" and "Testing Strategy" (`:92-94, :175-182`); ADR-006 `:13-34`; requirement baseline FR-02-11, BR-02-07, AC-02-13, RS-013; TDD discovery finding on the broken `dist/server.mjs` entry.

### Evidence
Compose service definition; startup-guard test in `uat`; config review proving no secrets/database credentials in the stub; a stub-issued token validated through CAP-9; Playwright boot log on a free port.

### Demonstrates Reference Scenarios
RS-013 (API stops with an error naming the setting). RS-015 (one real-Google SIT check) belongs to CAP-12; automated tests here never depend on it. No UI inventory screen is implemented here.

### NFRs
- NFR-SEC-06 — fail-closed guard for the test-provider flag.
- NFR-SEC-05 — no secret or credential value present in Compose files or images.

### Constraints
- No off-the-shelf generic IdP image and no in-process test fake; no real Google credentials in CI.
- The stub is absent from UAT/production stacks; no new deployment ladder/target/strategy is decided.
- Stub keys generated at container start; no committed test key material.

### Assumptions
- The team's manual DEV/SIT procedure can add one Compose service with the same web/API tag pair (ADR-006 `:33`).

### Contracts / Interfaces
Provides the stub discovery/authorize/token/JWKS contract that CAP-9's pinned client consumes when `AUTH_TEST_PROVIDER=true`; provides the working E2E server entry consumed by CAP-11.

### API Surface (indicative)
Stub authorize, token and JWKS endpoints; API startup config validation.

### Data owned
Ephemeral in-container test signing keys; no database rows.

### Events published
None.

### Events consumed
`AUTH_TEST_PROVIDER` and `APP_ENV` configuration.

### Implementation Notes
The fail-closed check is release-critical evidence (AC-02-13). The stub exercises the same HTTP redirect/exchange/discovery path as real Google, so callback negative tests in CAP-9 remain meaningful.

### Out of scope for this capability
- PO-owned Google OAuth client registration (DEP-002), the RS-015 manual SIT check, UAT/production stacks, real-Google credentials in CI, and any production topology decision.

---

## CAP-11 — Web Sign-In and Account UI: Welcome, Route Guard, Avatar and Settings

**Depends on:** CAP-6, CAP-8, CAP-9, CAP-10
**Owning service:** Web
**Satisfies:** FR-02-05, FR-02-07, FR-02-08, FR-02-10, FR-02-13, AC-02-01, AC-02-04, AC-02-05, AC-02-09, AC-02-11, AC-02-12, AC-02-14, RS-001, RS-004, RS-005, RS-009, RS-011, RS-012, RS-014
**Governed by:** ADR-001, ADR-002, ADR-005
**Domain:** `web-auth-ui`

### Summary
Activate the welcome Google control with loading and error recovery, add the client route guard with return-to handling, add the header avatar, and build the minimal `/settings` page backed by `/me`. SCR-2…SCR-7 and CMP-1…CMP-9 are retained unchanged.

### Requirements (ADDED)

- **Requirement: Active Google action on SCR-1**
  - The welcome route SHALL present "Continue with Google" as a real `<button>` (Enter/Space activation, ≥44 × 44 CSS px) linking to `GET /api/v1/auth/google/start?returnTo=<known-route>`, replacing the stale "Sign in with Google" label; "Try a demo journal" SHALL remain visibly inactive and out of the tab order with no navigation, request or side effect.
  - Scenario: Signed-in start from welcome (RS-001)
    - **WHEN** a signed-out visitor activates "Continue with Google"
    - **THEN** the browser follows the same-origin `/api/v1/auth/google/start` link and no demo action fires.
  - Scenario: Demo remains inert
    - **WHEN** a keyboard user tabs through SCR-1
    - **THEN** "Try a demo journal" is not focusable and activating it causes no side effect.
- **Requirement: Loading and error states for sign-in (SCR-1)**
  - On activation the button SHALL set `aria-busy="true"` with an unchanged label and a `role="status"` line "Signing in…", with a 15-second "taking longer than expected" fallback and a finite timeout; a failed callback (`?auth_error=1`) SHALL show a `role="alert"` panel with the exact copy "We could not sign you in. Please try again." and a single primary "Try again" action that restarts the same flow, exposing no token, email or callback detail.
  - Scenario: Callback failure (RS-004)
    - **WHEN** the welcome route loads with `?auth_error=1`
    - **THEN** it shows the exact error copy and one "Try again" action and no callback internals in copy or URL.
  - Scenario: Long-running sign-in
    - **WHEN** sign-in has not resolved after 15 seconds
    - **THEN** the "taking longer than expected" fallback appears and focus stays on the action.
- **Requirement: Client route protection with return-to**
  - The client SHALL send a signed-out visitor opening any protected route (including `/settings` and the five shell destinations) to `/` carrying an allowlisted `returnTo`, and return them there after sign-in; a signed-in visitor opening `/` SHALL go to `/today`.
  - Scenario: Protected deep link (RS-011)
    - **WHEN** a signed-out user opens `/fuel`
    - **THEN** they go to `/` and after sign-in return to `/fuel`.
  - Scenario: Signed-in root (RS-012)
    - **WHEN** a signed-in user opens `/`
    - **THEN** the client redirects to `/today`.
- **Requirement: Minimal settings screen (SCR-8)**
  - `/settings` SHALL show the heading "Your account — Make it yours.", labelled "Display name" and "Email" values read from `GET /api/v1/me` with TanStack Query, and a primary "Sign Out" action reading its CSRF token from `GET /api/v1/auth/csrf`; loading SHALL keep label positions with reserved-height placeholders and a `role="status"` line "Loading account details…"; a failed `/me` SHALL show a section-level `role="alert"` with one "Try again" action; a 401 SHALL follow the route guard; sign-out SHALL show "Signing out…" with `aria-busy="true"` and on 204 go to `/`.
  - Scenario: Populated account (RS-005)
    - **WHEN** a signed-in user opens `/settings`
    - **THEN** the four account labels/values and "Sign Out" appear from the shared `/me` schema.
  - Scenario: Sign-out (RS-009)
    - **WHEN** the user activates "Sign Out" with a valid CSRF token and the API returns 204
    - **THEN** the session cookie is cleared and the visitor goes to `/`.
- **Requirement: Header avatar (CMP-12)**
  - Every signed-in shell view SHALL show a real link to `/settings` rendering the first character of the display name (initial "A" for "Alex Morgan"), with an accessible name that includes account context and a ≥44 × 44 CSS-px target, placed as the right-most top-navigation item at ≥768 px and as the trailing bottom-navigation item below 768 px.
  - Scenario: Avatar (RS-014)
    - **WHEN** a signed-in user named "Alex Morgan" looks at the header
    - **THEN** the avatar shows "A" and links to `/settings`.
- **Requirement: Additive, token-only, accessible UI**
  - New work SHALL live under `apps/web/src/features/auth/` with only small additions to the `app.tsx` route table and `ShellNavigation.tsx`; styling SHALL use CSS Modules and `apps/web/src/styles/tokens.css` only, light theme only, no raw visual token literals, zero axe level-A/AA violations at 360/768/1440 px, keyboard operation with visible focus, ≥44 × 44 px targets, no horizontal scroll, and the FRD-01 Dialog focus trap/return preserved.
  - Scenario: Responsive accessible rendering
    - **WHEN** axe and keyboard/measurement tests run on SCR-1 and SCR-8 at 360, 768 and 1440 px
    - **THEN** there are zero level-A/AA violations, all new controls are keyboard operable, and no horizontal scroll occurs.

### Requirement Coverage
TDD "Web client (FR-02-10, FR-02-13)" (`:122-124`); requirement baseline §7 welcome/settings copy, FR-02-10/13, AC-02-11/12/14, RS-001/004/005/009/011/012/014; UI inventory FRD-02 SCR-1/SCR-8 and CMP-10…CMP-14; UI contract FRD-02 implementation constraints (`:123-133`).

### Evidence
Playwright + axe runs against the stub at 360/768/1440 px; AC-ID-named E2E for first sign-in, wrong-state error, protected return-to, signed-in root, `/me` states, sign-out and avatar; keyboard/focus/44 px measurement tests.

### Demonstrates Reference Scenarios
RS-001, RS-004, RS-005, RS-009, RS-011, RS-012, RS-014. UI inventory: SCR-1 (`docs/design/mockup/welcome-sign-in.html`) via CMP-5 (demo portion, still inactive), CMP-10, CMP-11; SCR-8 (`docs/design/mockup/settings.html`) via CMP-1, CMP-12, CMP-13, CMP-14. The inventory carries no Figma node reference for these screens; the mockup HTML files are the concrete visual references.

### NFRs
- NFR-A11Y-01 — zero axe level-A/AA violations on welcome and `/settings`.
- NFR-A11Y-02 — keyboard operation; Dialog focus trap/return preserved.
- NFR-A11Y-03 — avatar and settings actions ≥44 × 44 CSS px.
- NFR-UX-001 — no horizontal scroll at 360/768/1440 px.
- NFR-PERF-004 — welcome LCP ≤2.5 s (measured by CAP-12).

### Constraints
- Only small additive edits to `app.tsx` and `ShellNavigation.tsx`; do not reorder the five FRD-01 destinations.
- Use the imported `apps/web/src/styles/tokens.css`, not the stale prose path; no dark class or alternate accent.
- No profile editing, no demo activation, no token storage outside the API's cookies.

### Assumptions
- CAP-8's `/me`, `/auth/csrf` and `/auth/sign-out` and CAP-9's `/auth/google/start` are available; CAP-10's E2E server entry boots.

### Contracts / Interfaces
Consumes CAP-6 shared schemas, CAP-8 account endpoints and CAP-9 start/redirect contract; drives the stub flow provided by CAP-10.

### API Surface (indicative)
Navigates to `GET /api/v1/auth/google/start`; calls `GET /api/v1/me`, `GET /api/v1/auth/csrf`, `POST /api/v1/auth/sign-out`.

### Data owned
No database rows; browser-visible session/CSRF cookies set by the API.

### Events published
None.

### Events consumed
`/me` response, CSRF token, `?auth_error=1` redirect marker, browser route and viewport state.

### Implementation Notes
Exact copy from FRD-02 §7 and `docs/design/ui-contract.md`: the shipped stale labels are wrong and the requirement is authoritative. Do not paraphrase the inventory into a second design; cite SCR/CMP identifiers and use the token file. A 401 from `/me` follows the guard rather than rendering an empty state.

### Out of scope for this capability
- Profile editing (FRD-03), changing SCR-2…SCR-7 content, dark theme/alternate accents, Google Sheets, account deletion, and any backend implementation.

---

## CAP-12 — DEV/SIT Quality Gates, Manual Promotion Evidence and SIT Sign-Off

**Depends on:** CAP-7, CAP-10, CAP-11
**Owning service:** Delivery
**Satisfies:** FR-02-11, FR-02-14, AC-02-13, NAC-02-05, NAC-02-06, NAC-02-07, RS-015, NFR-SEC-07, NFR-PERF-01, NFR-SEC-09, NFR-OPS-003
**Governed by:** ADR-001, ADR-006
**Domain:** `auth-quality-evidence`

### Summary
Assemble and retain the FRD-02 quality evidence and describe the manual, migration-first same-tag promotion and SIT smoke for DEV and SIT. This capability produces gates, reports and a checklist — not an IRIS deployment plan, a new topology, or any UAT/production rollout.

### Requirements (ADDED)

- **Requirement: FRD-02 quality gates on an integration commit**
  - CI SHALL run lint, typecheck, tests and coverage, migration checks against empty and preceding schemas, Playwright + axe on the changed screens, dependency scanning, CycloneDX SBOM generation, Lighthouse mobile on the welcome page, k6 for `GET /api/v1/me` at 50 concurrent users with one year of data, and the OWASP ASVS L1 V2/V3 authentication/session review; mandated gate failure SHALL fail the pipeline and evidence SHALL be retained.
  - Scenario: `/me` latency gate (NAC-02-06)
    - **WHEN** k6 drives `GET /api/v1/me` at 50 concurrent users with one year of seeded data in SIT
    - **THEN** p95 latency is ≤300 ms and the report is retained.
  - Scenario: Accessibility gate (NAC-02-07)
    - **WHEN** Playwright + axe run on SCR-1 and SCR-8 at 360/768/1440 px
    - **THEN** zero level-A/AA violations are reported and the report is retained.
  - Scenario: Security review gate (NAC-02-05)
    - **WHEN** the ASVS L1 V2/V3 review of the sign-in/session flow is completed
    - **THEN** all applicable checks pass and the report is retained with the SBOM and dependency scan.
- **Requirement: Manual, migration-first same-tag promotion**
  - The team SHALL promote one successful web/API image-tag pair from DEV to SIT without rebuilding, applying the three timestamp-prefixed migrations as a distinct step before starting the new API in each environment, verifying `user_identities`, `sessions` and `profiles` exist, adding the stub service only to DEV/SIT, and supplying all configuration and secrets through the environment/secret mechanism. SIT smoke SHALL confirm health/readiness, one-origin routing, request-ID logging with `user_id`, SIT HSTS and session-cookie attributes, a stub sign-in to `/today`, a `/me` response, sign-out with old-cookie 401, and recovery forward-only on migration failure.
  - Scenario: Same-image promotion with migrations first
    - **WHEN** a successful release moves from DEV to SIT
    - **THEN** the web and API artifacts keep the integration commit tag, the three tables exist before the API starts, and no UAT/production stack is touched.
- **Requirement: Single PO-dependent real-Google SIT check**
  - After DEP-002/TDD-OI-02 registration is available, QA SHALL perform one manual real-Google sign-in and sign-out check in SIT and retain the result; the automated suite SHALL remain independent of it.
  - Scenario: Real-Google SIT check (RS-015)
    - **WHEN** the PO has registered the SIT OAuth client and redirect URI and QA signs in and out with a real Google account
    - **THEN** both succeed and the record is retained; automated tests do not depend on this check.

### Requirement Coverage
TDD "Non-Functional Requirements" table (`:151-173`), "Testing Strategy" (`:175-182`) and "Rollout Plan — Deployment (manual)" (`:184-211`); requirement baseline NFR-SEC-07/PERF-01/PERF-004/A11Y-01/SEC-09/OPS-003, NAC-02-05…07, RS-015, definition of done (`:280`), delivery requirements (`:293-301`); ADR-001 same-tag promotion, ADR-006 stub-in-DEV/SIT-only.

### Evidence
Retained pipeline artifacts: AC/NAC results, migration output, Playwright/axe and Lighthouse reports, k6 report, dependency scan, CycloneDX SBOM, ASVS review, manual DEV/SIT promotion record, SIT smoke record and the RS-015 manual check record.

### Demonstrates Reference Scenarios
RS-015 (the one PO-registration-dependent real-Google SIT check). Other RS scenarios are demonstrated by the API/UI capabilities that implement them; no UI inventory screen is implemented here.

### NFRs
- NFR-SEC-07 — ASVS L1 V2/V3 review result.
- NFR-PERF-01 — `/me` p95 ≤300 ms at 50 concurrent users.
- NFR-SEC-09 — zero known critical/high dependency findings with SBOM.
- NFR-OPS-003 — migration gate on empty/preceding schemas.
- NFR-PERF-004 — welcome LCP ≤2.5 s.
- NFR-A11Y-01 — axe gate on the changed screens.

### Constraints
- No IRIS deployment plan, ladder/target/strategy record, or production topology change (deployment mode is `manual`).
- DEV and SIT only; no UAT/production deployment in this increment.
- Forward-only recovery after a successful migration; never an unsafe schema rollback.
- No auth SLO, alert, retention, backup/DR or runbook target is invented.

### Assumptions
- GitLab runners, registry and artifact storage are available; the manual promotion procedure in `docs/deploy/dev-to-sit-promotion.md` is followed by the team.
- DEP-002 registration is needed only for RS-015; its absence does not block the automated gates.

### Contracts / Interfaces
Consumes the CAP-7 migrations, CAP-10 stub service and CAP-11 screens/endpoints for gate execution; reads the FRD-01 same-tag release convention from `scripts/ci/promote-release.mjs` and `docs/deploy/dev-to-sit-promotion.md`.

### API Surface (indicative)
Exercises `/api/v1/health`, `/api/v1/ready` and the five FRD-02 endpoints for smoke/load evidence.

### Data owned
CI artifacts and manual deployment/SIT records; no application data.

### Events published
Build, migration, quality-gate and deployment evidence artifacts.

### Events consumed
Source commit, image pair, migration files, environment configuration and DEP-002 registration status.

### Implementation Notes
Keep the existing lint/typecheck/test/coverage, migration, Playwright/axe, dependency-scan/SBOM, Lighthouse and k6 gates and add auth-specific assertions; do not add a new deployment topology. The manual checklist must name the three migrations, the stub service and the new environment/secret names from the TDD rollout plan.

### Out of scope for this capability
- UAT/production rollout, container-host selection, rolling/blue-green/canary strategy, backup/restore/runbooks, production SLOs/alerts, TDD-02 reconciliation, and any IRIS-managed deployment.

---

## Cross-Cutting Concerns

- **Additive only.** New API code lives under `apps/api/src/plugins/` and `apps/api/src/modules/auth/`; new web code under `apps/web/src/features/auth/`. Shared-file edits stay small: one registration area in `apps/api/src/app.ts`, the route table in `apps/web/src/app.tsx`, the avatar in `apps/web/src/components/ShellNavigation.tsx`, and one additive export block in `packages/shared/src/index.ts`. No TDD-01 rule is changed; a needed change requires TDD-02.
- **Data access.** One mechanism: parameterized raw SQL over the existing `pg.Pool`, three timestamp-prefixed migrations, no Drizzle/second ORM/schema push. Reuse `uuidv7()`; never edit the FRD-01 users migration. Migrations run as a distinct step before the new API version; recovery is forward-only.
- **Security principal.** Every protected request derives identity, rate-limit key, `user_id` log field and authorization from the server-side session, never from browser display state. CSRF protects every changing request; the owner-scope helper forces `userId` and returns 404 for cross-user reads. Google's token proves identity only.
- **Secrets and logs.** `SESSION_SECRET`, `GOOGLE_CLIENT_SECRET` and other credentials come from environment configuration only, never committed or logged. pino redacts session IDs, ID tokens, access tokens and the transient auth cookie; health/readiness, request IDs, security headers and SIT HSTS from FRD-01 are preserved.
- **Error contract.** One envelope for all five endpoints with upper-snake-case codes; unknown/short-lived transient auth failures are generic, with no token, email or exception detail in URLs or logs.
- **Testing.** AC/NAC identifiers in test names; Fastify `inject` with real isolated PostgreSQL, unique databases, free ports and self-cleaned tagged data; Playwright + axe at 360/768/1440 px; stub-provider automated flow with the single real-Google check kept manual and PO-dependent.
- **UI.** Light warm-Peach only, CSS Modules and `apps/web/src/styles/tokens.css` only, no raw token literals; SCR-2…SCR-7 and CMP-1…CMP-9 retained unchanged; exact FRD-02 §7 copy; no prototype defects PD-01…PD-06.
- **Delivery.** Manual mode: one immutable web/API tag promoted DEV → SIT with migrations first; the team promotes images, IRIS writes no deployment plan; no UAT/production work in this increment.

## Dependency Order (Suggested Implementation Sequence)

Wave 1 (no prerequisites): CAP-6, CAP-7
Wave 2 (depends on Wave 1): CAP-8, CAP-10
Wave 3 (depends on Wave 2): CAP-9
Wave 4 (depends on Wave 3): CAP-11
Wave 5 (depends on Waves 1, 2, 4): CAP-12

## Summary Table

| ID | Capability | Depends on | Service | FRs |
|---|---|---|---|---|
| CAP-6 | Shared Auth Contracts and Error Mapping Extensions | — | Shared | FR-02-07, FR-02-09 |
| CAP-7 | Additive Identity, Session and Profile Schema with Enforced Owner Scope | — | API | FR-02-03, FR-02-12 |
| CAP-8 | Server-Side Session Principal, CSRF, Rate-Limit Keying and Account API | CAP-6, CAP-7 | API | FR-02-05, FR-02-06, FR-02-07, FR-02-08, FR-02-09, FR-02-14 |
| CAP-9 | Google OIDC Sign-In Boundary and Atomic First-Sign-In Identity | CAP-6, CAP-7, CAP-8 | API | FR-02-01, FR-02-02, FR-02-03, FR-02-04, FR-02-05 |
| CAP-10 | DEV/SIT Stub OIDC Provider, Fail-Closed Guard and Test Topology | CAP-6 | Delivery | FR-02-11 |
| CAP-11 | Web Sign-In and Account UI: Welcome, Route Guard, Avatar and Settings | CAP-6, CAP-8, CAP-9, CAP-10 | Web | FR-02-05, FR-02-07, FR-02-08, FR-02-10, FR-02-13 |
| CAP-12 | DEV/SIT Quality Gates, Manual Promotion Evidence and SIT Sign-Off | CAP-7, CAP-10, CAP-11 | Delivery | FR-02-11, FR-02-14 |
