# Design

## Context

See proposal.md for motivation. CAP-2 supplies the Fastify health endpoint and CAP-3 supplies the built React client. ADR-001 and TDD-01 §3 require the browser to see one origin, with the web container owning the `/api` route and the API remaining the sole database boundary.

## Goals / Non-Goals

**Goals:**
- Compose PostgreSQL 16, API, and web containers for local development.
- Serve static web assets and proxy `/api` under a single configurable host origin.
- Keep database configuration available only to the API container.

**Non-Goals:**
- Selecting a SIT host, provisioning any remote environment, or defining UAT/production release strategy.
- Activating OIDC, Google, Anthropic, demo, or journal behavior.

## Decisions

### Nginx static-server and reverse-proxy container

The web container SHALL use the pinned official `nginx:1.27.4-alpine` image. Nginx serves the Vite build output as static files, uses `try_files` to fall back to `index.html` for SPA routes, and proxies `/api` to the Compose API service. This implements the product-owner decision and preserves the TDD-01 §3 same-origin boundary without exposing the API as a separate browser origin.

Nginx is selected because it provides static-file delivery, deterministic SPA fallback, and reverse-proxy support in one small container image. A separate browser-facing API origin is rejected because it violates ADR-001; embedding a development server is rejected because the runtime must serve the built client reproducibly.

### Configurable host bindings

Compose SHALL expose the web service through an environment-configurable host port, defaulting only when the port is available. PostgreSQL SHALL use no fixed host binding; API and database communication stays on the internal Compose network. This prevents collisions with host services such as a native PostgreSQL instance on port 5432.

## Risks / Trade-offs

- [A configured web host port is already occupied] → Allow the developer to select another available host port through environment configuration.
- [SPA fallback intercepts API traffic] → Define the `/api` proxy location separately from the static-file fallback.
- [Runtime configuration reaches browser assets] → Pass `DATABASE_URL` only to the API service and assert the container configuration boundary in smoke coverage.

## Migration Plan

1. Build the web and API images through Compose.
2. Start the Compose stack with an available configured web host port.
3. Confirm same-origin `/api/v1/health` returns 200.
4. Stop the stack; no host service, fixed PostgreSQL host port, or persistent external configuration is introduced.
