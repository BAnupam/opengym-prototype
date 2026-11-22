# Proposal

## Why

The workspace foundation (CAP-1) establishes the pnpm workspace and shared contracts, but the API has no operational endpoints, no security middleware, and no database migration. FRD-01 requires the API to expose health/readiness, enforce security headers and rate limiting, and create the initial `users` schema — all before any authentication or journal behavior is added.

## What Changes

- **New `GET /api/v1/health` endpoint** — returns 200 while the API process is live.
- **New `GET /api/v1/ready` endpoint** — returns 200 only when PostgreSQL is reachable; returns 503 with `DATABASE_UNAVAILABLE` when not.
- **Request-ID middleware** — every API response includes `x-request-id`; every pino JSON log includes `request_id` for correlation.
- **Security headers** — CSP, `X-Content-Type-Options: nosniff`, and HSTS in SIT are sent on applicable responses.
- **Input validation** — shared Zod schemas validate API input; invalid input returns 400 with field errors.
- **Rate limiting** — general traffic limited to 300 requests per minute per source IP; the 301st request returns 429.
- **Initial `users` migration** — timestamp-prefixed SQL migration creates `users` with UUID v7 ID, unique email, display name, IANA time zone, UTC creation time, and `is_demo BOOLEAN NOT NULL DEFAULT false`.

**Breaking**: The existing `GET /health` route at root is replaced by `GET /api/v1/health` under the versioned prefix, matching the mandated same-origin boundary.

## Capabilities

### New Capabilities

- `api-foundation`: Health/readiness endpoints, security middleware (request ID, CSP, nosniff, rate limiting, validation), and initial PostgreSQL migration for the `users` table.

### Modified Capabilities

*(None. CAP-1 workspace-foundation spec is not modified; CAP-2 introduces new API behavior.)*

## Impact

- **API code** (`apps/api/src`): New plugins for request ID, security headers, rate limiting, validation, and database connectivity; new route handlers under `/api/v1`; new migration SQL file.
- **Shared schemas** (`packages/shared`): Potential addition of API response schemas and error code constants.
- **Dependencies**: `@fastify/rate-limit` for rate limiting; PostgreSQL client and Drizzle for database connectivity and migrations.
- **Testing**: API integration tests require a real PostgreSQL instance. Docker is available for a throwaway verification container.
- **Deferred scope**: No authentication, no session management, no journal routes, no external integrations (Google/OIDC/Anthropic), and no seed/demo data are introduced in this change.
