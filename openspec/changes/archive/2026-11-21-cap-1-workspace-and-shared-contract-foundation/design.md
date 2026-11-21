# Design

## Context

This is a greenfield repository with no application directories, no pnpm workspace configuration, and no root developer commands. The repository contains design documents, ADRs, a `design-system/opengym/tokens.css` file, and an OpenSpec configuration. TDD-01 mandates the technology stack and repository layout. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Create a pnpm 9 workspace with three packages: `apps/web`, `apps/api`, `packages/shared`.
- Root `package.json` with `install`, `lint`, `typecheck`, `test`, and `build` scripts that work across all packages.
- Strict TypeScript (`"strict": true`) in every package, with zero typecheck errors.
- ESLint import-boundary rules that fail on prohibited cross-package imports.
- `packages/shared` as a pure-type export package (Zod schemas + API types) with no runtime dependency on any app.

**Non-Goals:**
- API routes, database migrations, UI screens, Docker runtime, and CI release pipeline. These are later capabilities (CAP-2 through CAP-5).
- Authentication, journal behavior, demo-user creation, Google/OIDC/Sheets, Anthropic, and dark theme.

## Decisions

**pnpm workspaces over npm/yarn:** TDD-01 mandates pnpm 9 workspaces. This is the only choice for workspace orchestration.

**Vite for web bundler:** TDD-01 mandates React 19 + Vite 6. Vite provides native TypeScript transformation, CSS Modules support, and fast HMR for local development.

**Fastify for API server:** TDD-01 mandates Fastify 5. It provides built-in JSON schema validation, plugin architecture, and structured logging with pino.

**ESLint import-boundary rules:** Using `eslint-plugin-import` with `no-cycle` and custom `restrict` patterns to prevent: (a) `packages/shared` importing from `apps/*`; (b) `apps/web` importing from `apps/api`. Typecheck alone is insufficient because import errors only surface when the imported symbol is actually used.

**Project references for typecheck:** Each package gets its own `tsconfig.json` with `"composite": true`. A root `tsconfig.json` uses `"references"` to include all packages, so `tsc --build` compiles them in dependency order.

**Root-level lint config:** A single `.eslintrc.js` at the root extends to all packages via pnpm workspace scripts. Each package can override with a local `.eslintrc.js` that extends the root config.

## Risks / Trade-offs

[Risk] Adding a new framework dependency (e.g., a second state library or CSS-in-JS) violates TDD-01's dependency discipline rule.
Mitigation: The mandated stack (React + TanStack Query + CSS Modules) covers all FRD-01 needs; no additional framework is introduced.

[Risk] Import-boundary lint rules may produce false positives if a shared type is re-exported through an app package.
Mitigation: Only `packages/shared` exports shared types. The boundary lint rule explicitly allows imports from `packages/shared` in all packages.

## Migration Plan

No migration is needed. This is greenfield; no existing application code or configuration needs to be transformed.
