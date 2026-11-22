# OpenGym

OpenGym is a personal web-based training journal foundation for movement, nourishment, and recovery. This repository establishes the signed-out web shell, operational API, PostgreSQL migration base, local Docker stack, and CI/release quality gates that later product increments extend.

## Foundation scope

- React web shell with responsive navigation, welcome page, route placeholders, and accessible shared UI primitives.
- Fastify API health/readiness endpoints with structured logging, validation, security headers, and rate limiting.
- PostgreSQL/Drizzle migration foundation, including the initial `users` table.
- Docker Compose development environment and GitLab CI quality gates for DEV and SIT promotion.

Authentication, journal features, AI, Google integrations, and dark theme support are intentionally deferred.

## Local development

Use `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` from the repository root.

The Docker Compose stack starts PostgreSQL, the API, and the built web client. The web container uses Nginx to serve the SPA and proxy `/api` to the API, so browser traffic stays on one origin. PostgreSQL and the API have no host-port bindings. Set `WEB_PORT` to an available port before starting the stack (copy `.env.example` to `.env` if desired):

```sh
WEB_PORT=8081 docker compose up --build
```

Then open `http://localhost:8081` and verify `http://localhost:8081/api/v1/health`. Run `pnpm test:compose` to select a free port automatically, perform the same-origin health smoke test, and remove the temporary containers and volume.

## Documentation

- [Foundation requirements](docs/requirement/frd-01-app-foundation.md)
- [Foundation technical design](docs/design/frd-01-app-foundation.md)
- [Foundation architecture decision](docs/adrs/001-foundation-boundary-and-data-access.md)
- [UI inventory](docs/design/ui-inventory.md)
