# OpenGym

OpenGym is a personal web-based training journal foundation for movement, nourishment, and recovery. This repository establishes the signed-out web shell, operational API, PostgreSQL migration base, local Docker stack, and CI/release quality gates that later product increments extend.

## Foundation scope

- React web shell with responsive navigation, welcome page, route placeholders, and accessible shared UI primitives.
- Fastify API health/readiness endpoints with structured logging, validation, security headers, and rate limiting.
- PostgreSQL/Drizzle migration foundation, including the initial `users` table.
- Docker Compose development environment and GitLab CI quality gates for DEV and SIT promotion.

Authentication, journal features, AI, Google integrations, and dark theme support are intentionally deferred.

## Planned commands

After the foundation workspace is implemented, use `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` from the repository root. Run the local stack with `docker compose up --build`.

## Documentation

- [Foundation requirements](docs/requirement/frd-01-app-foundation.md)
- [Foundation technical design](docs/design/frd-01-app-foundation.md)
- [Foundation architecture decision](docs/adrs/001-foundation-boundary-and-data-access.md)
- [UI inventory](docs/design/ui-inventory.md)
