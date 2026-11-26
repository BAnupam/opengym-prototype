# 005. Session, CSRF, Rate-Limit Keying and Authorization Principal

## Status

Proposed

## Context

FRD-01 has no identity, session, or cookie code: the plugin list is `apps/api/src/app.ts:33-37` and rate limiting keys on `request.ip` (`apps/api/src/plugins/rate-limit.ts:5-8`). TDD-01 §4 mandates server-side sessions with a 30-day idle timeout, a random session ID cookie, and double-submit CSRF; TDD-01 §3.1 defines status codes including 401 (no session), 403 (CSRF), and 404 (not found or not owned). The approved baseline adds FR-02-05…10 and FR-02-14, NFR-SEC-01/02/06, NFR-PRIV-01, NFR-OPS-002, and DEC-008: signed-out requests keep IP-based keying while signed-in requests key on the session.

Because Google's ID token only proves identity, this ADR defines the server-side principal that all authorization derives from — the requirement "session as security principal" in the baseline and the `baseline-policy.json` controls `auth-check-required`, `tenant-isolation-independent-of-ai-output`, and `secrets-redacted-in-logs-and-traces`. The ADR for the callback itself is ADR-002; this one covers the boundary after a session exists.

## Decision

Create one server-side session row per sign-in with a 256-bit random ID, stored base64url-encoded as the cookie value and as the `sessions.id` primary key. Set the cookie `HttpOnly`, `SameSite=Lax`, and `Secure` when `APP_ENV=sit` (NFR-SEC-02). Every protected request resolves the row from the cookie, rejects missing/expired rows with 401 `UNAUTHORIZED`, and extends `expires_at` to 30 days from the current request. Sign-out deletes the row and clears the cookie so the old cookie returns 401.

CSRF uses double submit: `GET /api/v1/auth/csrf` sets a readable `XSRF-TOKEN` cookie containing an HMAC of the session ID with `SESSION_SECRET` and returns the same token; every POST/PUT/PATCH/DELETE requires it in `X-CSRF-Token`. The HMAC output never reveals the session ID and needs no new session column. Failure is 403 `CSRF_INVALID` through the central error handler.

Rate limiting keeps the 300/minute general limit. Key on the session identity once a session resolves; key on source IP for signed-out requests (DEC-008 option a). Configure Fastify `trustProxy` for the single nginx hop so the IP key reflects the client behind the documented proxy (`apps/web/nginx.conf:11`), and do not trust forwarded headers from any other source. Ensure the 429 body carries `error.code = RATE_LIMIT_EXCEEDED`, which the shipped test does not currently prove.

Authorization is enforced by a single shared repository helper: `userId` is its first parameter, every journal-data query filters on it, a query that omits it fails, and a cross-user read returns 404 `NOT_FOUND` rather than 403 to avoid existence disclosure. Add `user_id` to pino JSON logs when a session resolves and configure redaction for session ID, ID token, access token, and transient auth cookie, so zero such values appear in emitted logs (NFR-PRIV-01, NFR-OPS-002).

## Alternatives Considered

| Option | Why not chosen |
| --- | --- |
| JWT sessions without a server row | No immediate server-side revocation on sign-out; contradicts TDD-01 §4 and SRS-AUTH-04. |
| Rate-limit key per auth route, or IP key for everyone | DEC-008 recommends the session/IP split; per-route buckets do not distinguish signed-in from signed-out requestors and add state without a requirement. |
| Trust all `X-Forwarded-For` headers | Allows a client to choose its own bucket; only the known nginx hop is trusted. |
| CSRF token stored in a new session column | Adds a migration and a synchronisation path; an HMAC of the session ID gives double-submit semantics without exposing the ID. |
| Enforcement of owner scope in each feature module | Later FRDs could omit it; a single enforced helper with a failing-unit-test proof is the baseline's data-isolation primitive. |

## Consequences

- Sign-out is immediately effective (row deletion, not just cookie clearing), and expired sessions cannot be extended.
- Signed-out callers behind one NAT share an IP bucket — an accepted DEC-008 trade-off; proxy-trust configuration is deployment-sensitive and must be verified in each environment.
- The CSRF token is deterministic per session; it is not a secret value to log, and HMAC key rotation invalidates outstanding tokens (a deliberate re-fetch path).
- The owner-scope helper becomes a mandatory dependency of every later journal FRD; its unit test and cross-user 404 API test are release evidence.
- This ADR extends ADR-001 and ADR-002; it does not change the same-origin boundary, and it introduces no new TDD-01 rule.

## Related

- Requirement(s): FR-02-05, FR-02-06, FR-02-07, FR-02-08, FR-02-09, FR-02-12, FR-02-14; AC-02-05…AC-02-10; SEC-001, SEC-002, SEC-003, SEC-005, SEC-006, SEC-010; NFR-SEC-01, NFR-SEC-02, NFR-SEC-06, NFR-PRIV-01, NFR-OPS-002; DEC-008.
- Supersedes / Superseded by: None. Depends on ADR-001, ADR-002, ADR-004, `docs/source/TDD-01.md` §§3.1, 4, 10.
