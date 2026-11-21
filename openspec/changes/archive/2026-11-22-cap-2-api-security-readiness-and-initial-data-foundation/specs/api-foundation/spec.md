# Spec Delta

## Purpose

Establishes the Fastify API's operational endpoints, security middleware, and initial PostgreSQL data migration for the signed-out foundation.

## ADDED Requirements

### Requirement: Observable liveness and readiness

The API SHALL return 200 from `GET /api/v1/health` while its process is live. The API SHALL return 200 from `GET /api/v1/ready` only when PostgreSQL is reachable.

#### Scenario: Health check on live process
- **WHEN** an operator requests `GET /api/v1/health`
- **THEN** the API returns 200

#### Scenario: Readiness with PostgreSQL reachable
- **WHEN** PostgreSQL is reachable and an operator requests `GET /api/v1/ready`
- **THEN** the API returns 200

#### Scenario: Readiness with PostgreSQL unavailable
- **WHEN** PostgreSQL is unavailable and an operator requests `GET /api/v1/ready`
- **THEN** the API returns 503 with error code `DATABASE_UNAVAILABLE`

### Requirement: Traceable and protected API boundary

Every API response SHALL include `x-request-id`. Matching pino JSON logs SHALL include `request_id`. API responses SHALL enforce validation, CSP, `nosniff`, SIT HSTS, and a 300-requests-per-minute-per-IP general limit.

#### Scenario: Correlated request
- **WHEN** an API consumer sends a request to any endpoint
- **THEN** the response `x-request-id` header matches a valid JSON log record's `request_id`

#### Scenario: Rate limit enforced
- **WHEN** one source IP makes its 301st general API request inside one minute
- **THEN** the API returns 429

#### Scenario: Security headers present
- **WHEN** an API consumer sends a request
- **THEN** the response includes `X-Content-Type-Options: nosniff` and a Content-Security-Policy header

### Requirement: Validation returns field errors

When the API receives a request with invalid input, it SHALL return 400 with field-level error details in the standard error envelope.

#### Scenario: Invalid input rejected
- **WHEN** an API request carries fields that fail shared Zod schema validation
- **THEN** the API returns 400 with the `VALIDATION_FAILED` error code and field-level details

### Requirement: Versioned initial user schema

The API database area SHALL contain a timestamp-prefixed SQL migration that creates `users` with UUID v7 ID, unique email, display name, IANA time zone, UTC creation time, and `is_demo BOOLEAN NOT NULL DEFAULT false`.

#### Scenario: Empty-database migration
- **WHEN** the migration runs against an empty PostgreSQL 16 database
- **THEN** the `users` table is created with all specified columns and constraints

#### Scenario: is_demo defaults to false
- **WHEN** a row is inserted into `users` without specifying `is_demo`
- **THEN** `is_demo` is `false`
