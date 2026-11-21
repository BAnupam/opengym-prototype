# 001. Foundation Boundary and Data Access

## Status
Accepted

## Context

FRD-01 creates OpenGym's first browser-facing foundation. `docs/source/TDD-01.md` §§1–3 mandates a React/Vite web client, Fastify API, PostgreSQL 16 with Drizzle SQL migrations, one browser origin with `/api`, and API-only database access. `docs/requirement/frd-01-app-foundation.md` requires health/readiness, the initial `users` table, security headers, validation, and IP-based rate limiting while explicitly deferring Google OIDC, Google Sheets, Anthropic, sessions, and journal behavior.

There are no previous ADRs. This records the mandated initial service/data boundary and its security treatment so subsequent FRDs extend it rather than bypass it. The browser-to-API surface is externally reachable in DEV/SIT and is documented with a STRIDE threat model as required by the governance baseline.

### Threat model (STRIDE)

| Threat | Foundation exposure | Mitigation / verification |
| --- | --- | --- |
| Spoofing | A caller can send arbitrary unauthenticated requests. | No protected/user-data route exists in FRD-01; later authentication must add server-side authorization independently of identity-provider authentication. |
| Tampering | Malformed request data or proxy/header manipulation could alter request handling. | Shared Zod validation at the API boundary; CSP, `nosniff`, HSTS in SIT, and no browser database access; API tests cover invalid input and headers. |
| Repudiation | An operator cannot correlate a request to logs. | Generate/propagate `x-request-id`; pino JSON logs include `request_id`; correlation is tested. |
| Information disclosure | Database credentials/data or secrets could reach the browser or logs. | API alone receives `DATABASE_URL`; secrets come only from environment configuration and are redacted/not committed; no user-data endpoint or external integration is enabled. |
| Denial of service | Anonymous callers can flood foundation endpoints. | General source-IP limit of 300 requests/minute; request 301 returns 429; health/readiness are smoke/load checked. |
| Elevation of privilege | Browser code could access PostgreSQL or dormant integration capability. | The API is the only database boundary; welcome actions are inert; no identity-provider, AI, or Google API route exists. Future identity work requires explicit server-side authorization checks. |

## Decision

Implement the mandated modular foundation as a same-origin React web container/static server and Fastify API container, with `/api/v1` proxied to the API. PostgreSQL is accessed only by the API using Drizzle and timestamp-prefixed SQL migrations. The initial migration creates `users` with UUID v7, unique email, display name, IANA time zone, UTC creation time, and `is_demo` defaulting to false. No external integration or authentication boundary is activated in FRD-01.

## Alternatives Considered

| Option | Why not chosen |
| --- | --- |
| Direct browser-to-PostgreSQL access | Breaks the mandated API-only data boundary and would expose credentials/data. |
| Separate web and API origins | Breaks the mandatory single-origin `/api` constraint and adds CORS/session complexity before it is needed. |
| Activate Google OIDC or demo signup now | Outside FRD-01 scope and would create an identity boundary before its authorization controls are designed. |
| Use non-versioned schema push or a different persistence store | Contradicts the project-mandated PostgreSQL/Drizzle SQL migration choice and removes required migration traceability. |

## Consequences

- Web/API releases must retain their same commit tag and be deployed as a matched pair; the web proxy owns the `/api` route.
- Database changes are reviewable and ordered, but releases must run migrations separately before the new API and favor forward recovery after migration.
- The API foundation must keep validation, logging, header, readiness, and rate-limit controls even though there is no sign-in yet.
- Later authentication and integrations require their own ADR/security treatment before any public registration or external service invocation is introduced.

## Related

- Requirement(s): FR-002, FR-003, FR-004, FR-005, FR-009; BR-001, BR-002; NFR-SEC-003, NFR-SEC-004, NFR-SEC-005, NFR-SEC-006, NFR-OPS-001, NFR-OPS-002, NFR-OPS-003.
- Supersedes / Superseded by: None; depends on `docs/source/TDD-01.md` §§1–3 and §§7–8.
