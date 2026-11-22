# Proposal

## Why

Developers need a reproducible local runtime that verifies the foundation's required browser-to-API-to-PostgreSQL boundary. The stack must make the required same-origin `/api` path observable before CI and environment promotion work begins.

## What Changes

- Add a Docker Compose development stack for PostgreSQL 16, the Fastify API, and the React web application.
- Serve the web application at `localhost:8080` and proxy `/api` to the matched API container.
- Define container configuration so database access is supplied only to the API through environment variables.
- Add repeatable local smoke coverage for the same-origin health path and container configuration boundary.
- Keep SIT host provisioning, UAT/production runtime, release strategy, and external integrations out of scope.

## Capabilities

### New Capabilities
- `local-runtime`: Containerized local development runtime that serves web and API under one origin while keeping database configuration in the API container.

### Modified Capabilities
- `web-shell`: Relocate the token contract into the web source tree so its build context contains the token stylesheet.

## Impact

Adds Compose and container build definitions, reverse-proxy configuration, local runtime documentation, and smoke tests. The change implements FR-002 and ADR-001 without changing the API or web-shell behavior already specified.
