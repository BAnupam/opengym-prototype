# 002. Google OIDC Sign-In Boundary and Callback Verification

## Status

Proposed

## Context

FRD-02 adds an externally reachable Google OpenID Connect callback and an identity-provider integration to the deployed FRD-01 foundation. `docs/source/TDD-01.md` §4 mandates the authorization-code flow with PKCE, `state`, `nonce`, and scopes `openid email profile`, but names no OIDC library; the new dependency must be justified in a feature ADR (TDD-01 `:38`). The approved baseline requires that failed callback checks create no session (FR-02-02, AC-02-04) and that the threat model be recorded in the feature ADR (SEC-011).

ADR-001 is Accepted, documents the same-origin/API-only boundary with a STRIDE threat model, and explicitly defers identity work to "its own ADR/security treatment" (`:41`). This ADR extends ADR-001; it does not supersede or edit it. There is no auth code in the repository today: the plugin list is `apps/api/src/app.ts:33-37` and the five auth routes do not exist.

`incode-opencode/governance/baseline-policy.json` makes two controls non-overridable for this design: `security.nonOverridable.threat-model-required-for-new-external-boundaries` (the threat model belongs in the ADR, not a later audit) and `identity-provider-public-registration-requires-review` (self-service registration needs an explicit rationale, an explicit immediate-access scope, and server-side authorization checks independent of the IdP). The architecture control `boundary-decision-requires-adr` covers the new integration style.

### Threat model (STRIDE) — OAuth callback and session boundary

| Threat | Exposure at the new boundary | Mitigation / verification |
| --- | --- | --- |
| Spoofing | An attacker replays or forges a callback, or substitutes a different Google identity. | `openid-client` validates ID-token signature, `iss`, `aud`, `exp`; `state`, `nonce`, and PKCE verifier are bound to a signed, short-lived (10-minute) transient auth cookie; identity is keyed on subject `(provider, subject)`, never on email or display name (ADR-003). Negative tests cover each check (AC-02-04); failed checks create no session. |
| Tampering | Authorization parameters, cookies, or redirect targets are altered in transit or by the browser. | Authorization URL is built server-side; transient cookie is signed with `SESSION_SECRET`; `returnTo` is allowlisted to known routes; shared Zod validation on all inputs; existing CSP, `nosniff`, and SIT HSTS retained; session cookie is `HttpOnly`/`SameSite=Lax`/`Secure` in SIT. |
| Repudiation | A sign-in, sign-out, or failed callback cannot be correlated to logs. | Existing `x-request-id` and `request_id` log field retained; `user_id` added once a session resolves. Session ID, ID token, access token, and the transient auth cookie are redacted in pino; log-capture test NAC-02-04 verifies zero such values. |
| Information disclosure | Tokens leak via URLs, logs, or error messages; another user's data is readable. | No token, email, or exception detail in redirect URLs or log lines; generic "We could not sign you in. Please try again." on failure; API-only Google and database credentials; owner-scope helper enforces `user_id` and returns 404 for cross-user reads (ADR-005, NAC-02-02). |
| Denial of service | Repeated callback attempts or a flood of sign-in starts exhaust the API. | 300/minute limit retained; signed-out requests keyed on source IP and signed-in requests on session (ADR-005, NAC-02-03); transient auth cookie has a 10-minute expiry; callback failure creates no session row. |
| Elevation of privilege | Google's confirmation of identity is mistaken for authorization to application data; the stub becomes enabled in a real environment. | A newly-created principal's scope is explicitly limited (below); every protected request resolves a server-side session, and changing requests require CSRF; owner-scope check is enforced by the data layer independently of the IdP; `AUTH_TEST_PROVIDER=true` is refused at startup when `APP_ENV` is `uat` or `prod` (AC-02-13, ADR-006). |

### Identity-provider registration review

- **(a) Why self-service registration is required.** OpenGym has no administrator or provisioning role in this release (BRD-01 §3; baseline stakeholder section), and SRS-AUTH-01/JRN-001 require a new Google account to create an OpenGym account on first sign-in. Admin-provisioned accounts would introduce a role and an out-of-band step that FRD-02 explicitly excludes. The Product Owner owns Google OAuth client registration per environment (DEP-002/TDD-OI-02); registration is of the client, not of individual users.
- **(b) What a newly-created principal can access immediately.** Exactly: `GET /api/v1/me` for its own record, the same-origin signed-in shell/placeholder routes, `GET /api/v1/auth/csrf`, `POST /api/v1/auth/sign-out`, and a minimal `/settings` page showing its own display name and email. It cannot access another user's data, admin functions (none exist), demo journals, Google Sheets authorization, account deletion, or dark-theme activation — all out of scope (baseline `:63-68`). Its profile begins with the fixed SRS-AUTH-02 defaults stored by ADR-003.
- **(c) Server-side checks independent of Google's authentication.** Google's ID token only establishes identity. Authorization is enforced by: server-side session-row lookup and 30-day expiry check on every protected request (401 `UNAUTHORIZED` without a valid row); double-submit CSRF on every POST/PUT/PATCH/DELETE (403 `CSRF_INVALID`); the owner-scope repository helper requiring `userId` as its first argument and returning 404 rather than 403 for cross-user reads; and subject-keyed identity resolution so a changed email or display name cannot widen scope. These checks are proven in the same change set by NAC-02-02, AC-02-06, AC-02-09, AC-02-10, the cross-user API test, and the ASVS L1 V2/V3 review (NAC-02-05).

## Decision

Use a pinned version of `openid-client` as the single OIDC client library for provider discovery, server-side authorization-URL construction with PKCE/`state`/`nonce`, the authorization-code exchange, and ID-token validation. The API, never the browser, owns all verification; the callback creates a session only after every check passes. The exact pinned version is fixed when the dependency is added and must not float. One runtime dependency is accepted; no second OIDC/JWT framework is added. The API alone holds `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OIDC_REDIRECT_URI`, and `SESSION_SECRET`, from environment configuration only.

## Alternatives Considered

| Option | Why not chosen |
| --- | --- |
| Google's `google-auth-library` | Vendor-maintained verification but PKCE/nonce/state lifecycle still needs bespoke handling; DEC-003 recommends a well-maintained OIDC client library and the simplest full-flow implementation. |
| Hand-rolled flow with `fetch` and Node `crypto` | Puts JWK retrieval, signature verification, and claim checks on the team, raising the risk of a missed check (RSK-001) and increasing ASVS evidence work. |
| Implicit or hybrid flow with tokens in the browser | Contradicts TDD-01 §4 (authorization code + PKCE) and exposes tokens to client-side code. |
| Separate API origin with CORS | Breaks the mandated single-origin `/api` boundary recorded in ADR-001 and TDD-01 §3. |

## Consequences

- One new runtime dependency is added and pinned; its ADR justification is recorded here, satisfying TDD-01 `:38`. A version change is a deliberate, reviewed update.
- Callback negative tests become release-critical evidence for every validation check; a failed check must never leave a session row or cookie.
- The identity-provider registration review above is binding: no later FRD may treat Google authentication as authorization to application data, and the owner-scope check must ship in the same change set.
- This ADR extends ADR-001 without changing it; the same-origin, API-only database boundary and modular monolith remain unchanged.
- The stub provider used by automated tests is a separate decision in ADR-006; real-Google SIT verification depends on PO registration (DEP-002).

## Related

- Requirement(s): FR-02-01, FR-02-02, FR-02-05, FR-02-07, FR-02-08; AC-02-01, AC-02-04; SEC-004, SEC-011; NFR-SEC-02, NFR-SEC-05, NFR-SEC-07, NFR-PRIV-01; DEC-003.
- Supersedes / Superseded by: None. Depends on and extends `docs/adrs/001-foundation-boundary-and-data-access.md` and `docs/source/TDD-01.md` §§3–4.
