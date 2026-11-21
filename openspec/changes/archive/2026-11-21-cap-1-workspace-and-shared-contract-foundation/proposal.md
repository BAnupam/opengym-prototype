# Proposal

## Why

This greenfield repository currently has no application code, no pnpm workspace configuration, and no root developer commands. Without these structural foundations, no subsequent capability can build, test, or enforce module boundaries. This change establishes the workspace skeleton, root commands, and shared-contract ownership that the entire project depends on.

## What Changes

- Create `pnpm-workspace.yaml` to register `apps/web`, `apps/api`, and `packages/shared` as workspace members.
- Create root `package.json` with `pnpm` 9 workspace scripts: `install`, `lint`, `typecheck`, `test`, and `build`.
- Scaffold `apps/web` as a React 19 + Vite 6 client package with strict TypeScript, CSS Modules, and the design-token import contract.
- Scaffold `apps/api` as a Fastify 5 server package with strict TypeScript, pino JSON logging, and Zod validation.
- Create `packages/shared` as a pure-type package exporting Zod schemas and API types, importing no application code.
- Configure ESLint with `typescript-eslint` and Prettier across all packages, including import-boundary rules that fail when `packages/shared` imports from `apps/*` or `apps/web` imports from `apps/api`.
- Add root-level TypeScript project references so `pnpm typecheck` validates all packages.

## Capabilities

### New Capabilities
- `workspace-foundation`: pnpm workspace configuration, root developer quality commands, strict TypeScript across all packages, enforced import-boundary rules, and the `packages/shared` ownership contract.

### Modified Capabilities

None. This is greenfield; no existing specs are modified.

## Impact

- All subsequent capabilities depend on this workspace structure: they add folders under `apps/web/src/features/` and `apps/api/src/modules/` and import from `packages/shared`.
- Root commands (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`) become the quality gate for CI and local development.
- Import-boundary lint rules prevent cross-application coupling that would break the mandated Browser → Fastify → PostgreSQL architecture.
- **FRD/ADR traceability:** FRD-01 FR-001; TDD-01 §§1-2; no ADR governs this change.
- **Deferred scope:** Authentication, journal behavior, demo-user creation, Google/OIDC/Sheets, Anthropic, dark theme, Docker runtime, and CI pipeline are all out of scope for this capability.
