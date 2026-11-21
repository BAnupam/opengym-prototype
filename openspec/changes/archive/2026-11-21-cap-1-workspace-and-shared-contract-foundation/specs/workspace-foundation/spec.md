# Spec Delta

## Purpose

Establishes the pnpm workspace structure, root developer quality commands, strict TypeScript configuration, and enforced import-boundary rules that every subsequent capability depends on for correct build, test, and CI operation.

## ADDED Requirements

### Requirement: Reproducible workspace commands
The repository SHALL provide pnpm workspace configuration and root install, lint, typecheck, test, and build commands for web, API, and shared packages.

#### Scenario: Clean build
- **WHEN** a developer runs `pnpm install` followed by `pnpm build` from a clean clone
- **THEN** both commands finish with exit code 0.

### Requirement: Enforced module boundaries
`packages/shared` SHALL own shared Zod schemas and API types without importing either application, and the web application SHALL not import API implementation code.

#### Scenario: Boundary verification for shared
- **WHEN** linting and typechecking run
- **THEN** prohibited cross-application imports from `packages/shared` into `apps/*` fail the relevant quality gate.

#### Scenario: Boundary verification for web
- **WHEN** linting and typechecking run
- **THEN** prohibited cross-application imports from `apps/web` into `apps/api` fail the relevant quality gate.

### Requirement: Strict TypeScript across all packages
Every package in the workspace SHALL use `"strict": true` in its `tsconfig.json` and SHALL produce zero typecheck errors under `pnpm typecheck`.

#### Scenario: Zero type errors
- **WHEN** `pnpm typecheck` is run from the repository root
- **THEN** it finishes with exit code 0 and reports no errors in any workspace package.
