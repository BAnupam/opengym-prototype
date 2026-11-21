# Design

## Context

The workspace foundation (CAP-1) established the pnpm workspace, root commands, and shared contracts. The API directory (`apps/api`) contains a skeleton Fastify instance with a `/health` route and a basic test. The project mandates PostgreSQL 16 with Drizzle SQL migrations, same-origin deployment under `/api/v1`, and API-only database access. The STRIDE threat model in ADR-001 governs the security controls.

## Goals / Non-Goals

**Goals:**
- Implement Fastify plugins for request ID, security headers, rate limiting, and validation
- Route health and readiness endpoints under `/api/v1` with proper status codes
- Create and test the initial `users` PostgreSQL migration
- Verify all tests against a real PostgreSQL instance

**Non-Goals:**
- Authentication, session management, or user-data routes
- External integrations (Google, Anthropic, OIDC)
- Seed/demo data
- CI pipeline or Docker Compose (those are later capabilities)

## Decisions

### Rate-limiting: @fastify/rate-limit with local store
- **Decision**: Use `@fastify/rate-limit` with an in-memory store, keyed by source IP.
- **Why**: No session/auth exists yet; IP-based limiting is mandated. Redis or external store would add infrastructure complexity before it is needed. The spec requires 300 requests/minute per IP.
- **Alternatives considered**: Custom middleware — rejected; the Fastify plugin integrates with its error handling and is battle-tested.

### Database connectivity: native pg (node-postgres)
- **Decision**: Use `pg` directly for the readiness check and migration, not an ORM.
- **Why**: The readiness check needs a simple connection test; the migration is SQL-driven. Drizzle's runtime is for application queries, not for a bare connectivity probe or migration runner in FRD-01. ADR-001 mandates Drizzle SQL migrations, but the readiness plugin only needs `pg`.
- **Alternatives considered**: Drizzle for readiness — rejected; it adds a dependency layer for a simple connection check.

### Migration storage: versioned SQL files in `apps/api/src/db/migrations/`
- **Decision**: Place timestamp-prefixed `.sql` files in a dedicated `db/migrations` directory under the API source.
- **Why**: The project mandates `YYYYMMDDHHMMSS_` prefixes for Drizzle SQL migrations. A dedicated directory keeps migrations discoverable and separate from application code.

### Security headers: custom Fastify plugin
- **Decision**: Implement CSP and `nosniff` as a custom Fastify hook plugin rather than a third-party package.
- **Why**: The CSP must be scoped to this foundation's resources only (no third-party origins). A custom plugin gives exact control over the policy string and ensures HSTS is only added in SIT via environment variable.

### Request ID: crypto.randomUUID()
- **Decision**: Generate `x-request-id` with `crypto.randomUUID()` (UUID v4) on every incoming request.
- **Why**: Node 22 provides this natively; it is sufficient for correlation and requires no dependency.

## Risks / Trade-offs

- [Rate-limit memory growth] → The in-memory store holds per-IP counters. This is acceptable for FRD-01's foundation scope; production rate limiting will use an external store later.
- [Migration ordering] → Timestamp prefixes avoid parallel-branch collisions within a window. The migration runner checks for already-applied versions before executing. A follow-up capability may add a schema version table.
- [No rollback migration] → ADR-001 mandates forward-only recovery after migration failure. This design follows that: no reverse migration is created.

## Migration Plan

1. Start a throwaway PostgreSQL 16 container for test verification.
2. Apply the initial `users` migration SQL against the empty test database.
3. Verify the `users` table structure and `is_demo` default.
4. Run the test suite against the live container.
5. Stop and remove the container.

The migration SQL is committed as a versioned file and applied separately before the new API starts in any deployment, per ADR-001.
