# Tasks

## 1. Workspace Configuration

- [x] 1.1 Create `pnpm-workspace.yaml` listing `apps/*` and `packages/*` and verify the file is valid workspace config recognized by pnpm
- [x] 1.2 Create root `package.json` with name `opengym`, pnpm-workspace `install`, `lint`, `typecheck`, `test`, and `build` scripts, and verify `pnpm install` succeeds with exit code 0

## 2. Shared Package Foundation

- [x] 2.1 Create `packages/shared` with `package.json` (exports `src/index.ts`), `tsconfig.json` with `"strict": true` and `"composite": true`, and verify `tsc --build` compiles with exit code 0
- [x] 2.2 Create `packages/shared/src/index.ts` exporting a base `ApiErrorEnvelope` Zod schema and verify it typechecks
- [x] 2.3 Add a test in `packages/shared` verifying `ApiErrorEnvelope` validates correctly and verify `pnpm test` passes

## 3. API Package Scaffold

- [x] 3.1 Create `apps/api` with `package.json` depending on `packages/shared` (workspace), Fastify 5, Zod 3, and pino; `tsconfig.json` with `"strict": true` and `"composite": true` and verify `tsc --build` compiles with exit code 0
- [x] 3.2 Create `apps/api/src/app.ts` with a minimal Fastify server import from `packages/shared` and verify it typechecks
- [x] 3.3 Add a test in `apps/api` verifying the server typechecks and verify `pnpm test` passes

## 4. Web Package Scaffold

- [x] 4.1 Create `apps/web` with `package.json` depending on `packages/shared` (workspace), React 19, Vite 6, and TypeScript; `tsconfig.json` with `"strict": true` and `"composite": true`; `vite.config.ts` and verify `tsc --build` compiles with exit code 0
- [x] 4.2 Create `apps/web/src/main.tsx` importing `../../../design-system/opengym/tokens.css` first and a minimal React app root, and verify it typechecks
- [x] 4.3 Create `apps/web/index.html` as the Vite entry point and verify `pnpm build` produces a dist with exit code 0
- [x] 4.4 Add a test in `apps/web` verifying the app typechecks and verify `pnpm test` passes

## 5. Root TypeScript Project References

- [x] 5.1 Create root `tsconfig.json` with `"references"` to `apps/web`, `apps/api`, and `packages/shared` and verify `pnpm typecheck` (`tsc --build`) succeeds with exit code 0

## 6. Lint and Import Boundary Rules

- [x] 6.1 Create root ESLint config with `typescript-eslint` and Prettier plugins and verify `pnpm lint` passes with exit code 0
- [x] 6.2 Add ESLint import-boundary rules: `packages/shared` must not import from `apps/*`, and `apps/web` must not import from `apps/api`; verify a deliberately prohibited import in each causes lint to exit non-zero

## 7. Integration Verification

- [x] 7.1 Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` from root and verify all finish with exit code 0
