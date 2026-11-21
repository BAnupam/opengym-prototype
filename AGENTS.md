# OpenGym Agent Guide

## Project

OpenGym is a greenfield personal training-journal web application. FRD-01 establishes its signed-out foundation; authentication, journals, AI, Google integrations, and dark mode are deferred.

## Stack

- TypeScript 5 strict, Node.js 22 LTS, pnpm 9 workspaces
- React 19, Vite 6, React Router, TanStack Query, CSS Modules
- Fastify 5, Zod shared schemas, pino JSON logging
- PostgreSQL 16, Drizzle ORM and timestamp-prefixed SQL migrations
- Vitest, Playwright with axe, k6, Docker Compose, GitLab CI

## Repository layout

- `apps/web`: React SPA, application shell, feature modules, shared UI
- `apps/api`: Fastify server, plugins, modules, and database code
- `packages/shared`: Zod schemas and API types; it imports no app code
- `e2e` and `load`: browser and load tests
- `docs`: requirements, ADRs, technical/UI designs, and decomposition increments

## Coding conventions and style guidelines

- Use strict TypeScript and the mandated project stack; do not add a second framework where the stack already supplies a solution.
- Keep feature changes additive: place web work under `apps/web/src/features/` and API work under `apps/api/src/modules/`; keep shared-index edits small.
- The web app imports no API implementation. Browser traffic uses same-origin `/api/v1`; only the API accesses PostgreSQL.
- Define JSON request/response contracts as shared Zod schemas. Use upper-snake-case API error codes and the established error envelope.
- Use CSS Modules and `design-system/opengym/tokens.css` only; do not introduce raw visual token literals. Preserve the light warm-Peach UI contract.
- Keep secrets in environment configuration only; never commit or log them.

## Testing

- Map acceptance tests to AC identifiers. Use Fastify inject plus real PostgreSQL for API integration tests.
- Run Playwright and axe on changed screens; preserve keyboard, focus, responsive, and 44px mobile-target coverage.
- Tests must isolate databases and ports so concurrent worktrees can run safely.

## Build and run

- `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`
- `docker compose up --build` for the local PostgreSQL, API, and web stack

## Project rules

- Migrations are versioned SQL files with `YYYYMMDDHHMMSS_` prefixes and run before new API versions.
- Do not activate OIDC, demo sign-in, Google, Anthropic, or journal behavior in FRD-01.
- Preserve same-image/tag promotion from DEV to SIT and retain quality/SBOM evidence.
