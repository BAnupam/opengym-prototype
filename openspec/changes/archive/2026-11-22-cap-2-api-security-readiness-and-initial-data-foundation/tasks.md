# Tasks

## 1. Dependencies

- [x] 1.1 Add `@fastify/rate-limit` to `apps/api/package.json` dependencies and verify installation succeeds via `pnpm install`
- [x] 1.2 Add `pg` (node-postgres) to `apps/api/package.json` dependencies and verify installation succeeds

## 2. Request ID Plugin

- [x] 2.1 Create `apps/api/src/plugins/requestId.ts` — Fastify onRequest hook generating `x-request-id` via `crypto.randomUUID()` and attaching to request object, and verify a test confirms the header is present on response
- [x] 2.2 Wire the plugin into `apps/api/src/app.ts` registration order and verify the exported app instance includes it

## 3. Security Headers Plugin

- [x] 3.1 Create `apps/api/src/plugins/securityHeaders.ts` — Fastify onRequest hook setting `X-Content-Type-Options: nosniff` and Content-Security-Policy, conditionally adding HSTS when `APP_ENV` is `sit`, and verify a test confirms the headers are present on response
- [x] 3.2 Wire the plugin into `apps/api/src/app.ts` and verify the app starts without error

## 4. Rate Limiting Plugin

- [x] 4.1 Create `apps/api/src/plugins/rateLimit.ts` — register `@fastify/rate-limit` with 300 requests per minute, keyed by `ip`, and verify a test confirms 429 on the 301st request within the window
- [x] 4.2 Wire the plugin into `apps/api/src/app.ts` and verify the app starts without error

## 5. Validation Plugin

- [x] 5.1 Create `apps/api/src/plugins/validation.ts` — Fastify onSend hook or error handler that formats Zod validation errors into the shared error envelope (`{ error: { code: "VALIDATION_FAILED", message, fields } }`), and verify a test confirms 400 with field errors on invalid input
- [x] 5.2 Wire the plugin into `apps/api/src/app.ts` and verify the app starts without error

## 6. Database Plugin

- [x] 6.1 Create `apps/api/src/plugins/database.ts` — reads `DATABASE_URL` from environment, creates a `pg` pool, and exposes a `checkConnection()` helper via `app.decorate`, and verify a test confirms the pool is decorated when the URL is valid
- [x] 6.2 Wire the plugin into `apps/api/src/app.ts` and verify the app starts when `DATABASE_URL` is set

## 7. Health and Readiness Routes

- [x] 7.1 Replace the root `/health` route with `GET /api/v1/health` returning `{ status: "ok" }` and 200, and verify a test confirms the route at `/api/v1/health` returns 200
- [x] 7.2 Add `GET /api/v1/ready` route that calls `checkConnection()` and returns 200 on success or 503 with `DATABASE_UNAVAILABLE` on failure, and verify a test confirms both outcomes
- [x] 7.3 Update `apps/api/src/app.test.ts` to exercise the new `/api/v1/` routes and verify the test suite passes

## 8. Migration

- [x] 8.1 Create `apps/api/src/db/migrations/20261121000000_create_users.sql` with the `users` table definition (UUID v7 id, unique email, display_name, time_zone, created_at, is_demo), and verify the SQL is syntactically valid
- [x] 8.2 Create a migration runner module `apps/api/src/db/migrate.ts` that executes unapplied SQL migrations in order and tracks applied migrations, and verify a test applies the migration to an empty PostgreSQL database and confirms the `users` table exists with correct structure

## 9. Request/Log Correlation

- [x] 9.1 Ensure pino logger configuration includes `request_id` in every log record by binding it in the requestId plugin, and verify a test confirms a log line contains the same `request_id` as the response `x-request-id`

## 10. Integration Verification

- [x] 10.1 Start a PostgreSQL 16 Docker container, apply the migration, and run the full API test suite against it, verifying all tests pass and the container is removed after the run
