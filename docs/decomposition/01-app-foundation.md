# Feature Decomposition: OpenGym FRD-01 App Foundation

**Format version:** 1
**Requirement:** docs/requirement/frd-01-app-foundation.md

## Summary

This increment establishes OpenGym's greenfield workspace, secure operational API and initial data migration, signed-out responsive web shell, local same-origin runtime, and CI/promotion evidence for DEV and SIT. It deliberately leaves authentication, journals, external integrations, and production delivery to later FRDs.

## Source Documents

- `docs/requirement/frd-01-app-foundation.md`
- `docs/design/frd-01-app-foundation.md`
- `docs/adrs/001-foundation-boundary-and-data-access.md`
- `docs/design/ui-inventory.md`
- `docs/design/ui-contract.md`
- `docs/source/TDD-01.md`

## Brainstorm Notes

**Core goal:** deliver a reproducible, deployable foundation without activating any future product behavior.

**Codebase findings:** this is greenfield: no application directories, baseline OpenSpec specs, or prior decomposition increment exist. The existing token contract is `design-system/opengym/tokens.css`; the web entry point must import it before other styles. There are no overlapping scenarios or existing validation/error paths to preserve.

**Resolved constraints:** the repository is a single pnpm workspace; Browser → Fastify → PostgreSQL is the mandatory boundary; web/API are one browser origin under `/api`; UI is light warm-Peach and token-only. The missing licensed persona artwork is an implementation risk, not authorization to extract it from screenshots.

**Out of scope:** sign-in/sessions, journal behavior, demo-user creation, Google/OIDC/Sheets, Anthropic, dark theme, UAT/production, and container-host selection.

---

## CAP-1 — Workspace and Shared Contract Foundation

**Depends on:** none (foundation capability)
**Owning service:** Platform
**Satisfies:** FR-001
**Governed by:** none
**Domain:** `workspace-foundation`

### Summary
Create the mandated pnpm workspace and root developer quality commands, with strict TypeScript and shared contract ownership. This capability creates no browser-facing feature or API behavior.

### Requirements (ADDED)

- **Requirement: Reproducible workspace commands**
  - The repository SHALL provide pnpm workspace configuration and root install, lint, typecheck, test, and build commands for web, API, and shared packages.
  - Scenario: Clean build
    - **WHEN** a developer runs `pnpm install` followed by `pnpm build` from a clean clone
    - **THEN** both commands finish with exit code 0.
- **Requirement: Enforced module boundaries**
  - `packages/shared` SHALL own shared Zod schemas and API types without importing either application, and the web application SHALL not import API implementation code.
  - Scenario: Boundary verification
    - **WHEN** linting and typechecking run
    - **THEN** prohibited cross-application imports fail the relevant quality gate.

### Requirement Coverage
FR-001 and TDD-01 §§1–2 require the workspace layout, strict TypeScript, root commands, and shared-contract boundaries.

### Evidence
Root command exit status, workspace manifests, strict TypeScript configurations, and boundary lint/typecheck tests.

### Demonstrates Reference Scenarios
RS-001.

### NFRs
- Strict TypeScript and zero lint/type errors.

### Constraints
- Use pnpm 9 workspaces and the mandated React/Fastify/Zod stack.

### Assumptions
- Node.js 22 and pnpm are available in local and CI environments.

### Contracts / Interfaces
Workspace package scripts and `packages/shared` Zod/API type exports.

### API Surface (indicative)
None.

### Data owned
None.

### Events published
None.

### Events consumed
None.

### Implementation Notes
Scaffold only the structural files needed for later capabilities; do not prebuild deferred feature modules.

### Out of scope for this capability
- API routes, database migrations, UI screens, Docker runtime, and CI release pipeline.

---

## CAP-2 — API Security, Readiness, and Initial Data Foundation

**Depends on:** CAP-1
**Owning service:** API
**Satisfies:** FR-003, FR-004, FR-005
**Governed by:** ADR-001
**Domain:** `api-foundation`

### Summary
Implement Fastify operational middleware and endpoints plus the first PostgreSQL migration. The API remains unauthenticated and exposes no user-data or external-integration route.

### Requirements (ADDED)

- **Requirement: Observable liveness and readiness**
  - The API SHALL return 200 from `GET /api/v1/health` while its process is live and SHALL return 200 from `GET /api/v1/ready` only when PostgreSQL is reachable.
  - Scenario: Database unavailable
    - **WHEN** PostgreSQL is unavailable and an operator requests `/api/v1/ready`
    - **THEN** the API returns 503 with error code `DATABASE_UNAVAILABLE`.
- **Requirement: Traceable and protected API boundary**
  - Every API response SHALL include `x-request-id`, matching pino JSON logs SHALL include `request_id`, and API responses SHALL enforce validation, CSP, `nosniff`, SIT HSTS, and a 300-requests-per-minute-per-IP general limit.
  - Scenario: Rate-limit boundary
    - **WHEN** one source IP makes its 301st general API request inside one minute
    - **THEN** the API returns 429.
  - Scenario: Correlated request
    - **WHEN** an API consumer sends a request
    - **THEN** the response request ID matches a valid JSON log record's `request_id`.
- **Requirement: Versioned initial user schema**
  - The API database area SHALL contain a timestamp-prefixed SQL migration that creates `users` with UUID v7 ID, unique email, display name, IANA time zone, UTC creation time, and `is_demo BOOLEAN NOT NULL DEFAULT false`.
  - Scenario: Empty-database migration
    - **WHEN** the migration runs against an empty PostgreSQL 16 database
    - **THEN** the `users` table is created with the specified constraints and `is_demo` defaults to false.

### Requirement Coverage
FR-003 through FR-005; BR-001 and BR-002; the API/data rules in the technical design.

### Evidence
Fastify inject and real-PostgreSQL tests for health/readiness, headers, validation, request/log correlation, 301st-request rejection, and empty/preceding-schema migration application.

### Demonstrates Reference Scenarios
RS-003, RS-004.

### NFRs
- NFR-SEC-003, NFR-SEC-004, NFR-SEC-005, NFR-SEC-006, NFR-OPS-001, NFR-OPS-002, NFR-OPS-003.

### Constraints
- API alone receives `DATABASE_URL`; all API contracts use shared Zod schemas; no authentication or external integration is activated.

### Assumptions
- Real PostgreSQL test instances can be provisioned with isolated databases.

### Contracts / Interfaces
`GET /api/v1/health`, `GET /api/v1/ready`, standard JSON error envelope, `users` schema, and shared validation/error types.

### API Surface (indicative)
`GET /api/v1/health`; `GET /api/v1/ready`.

### Data owned
`users` table and versioned Drizzle SQL migration metadata.

### Events published
None.

### Events consumed
Database connectivity state.

### Implementation Notes
Apply migrations as a distinct release action and favor reviewed forward recovery after a failed migration.

### Out of scope for this capability
- Sessions, user creation, journal tables, seed/demo data, OIDC, Google, and Anthropic routes.

---

## CAP-3 — Signed-Out Responsive Web Shell and Accessible Primitives

**Depends on:** CAP-1
**Owning service:** Web
**Satisfies:** FR-006, FR-007, FR-008, FR-010
**Governed by:** ADR-001
**Domain:** `web-shell`

### Summary
Deliver the token-wired signed-out React shell: welcome experience, five responsive navigation placeholders, not-found state, and shared accessible Dialog. It is static and intentionally produces no identity, API, or integration side effect.

### Requirements (ADDED)

- **Requirement: Responsive reload-safe shell navigation**
  - The web application SHALL render known routes `/`, `/today`, `/train`, `/fuel`, `/coach`, and `/grow`, preserving a requested known route after reload.
  - Scenario: Narrow navigation
    - **WHEN** a browser opens the application below 768 CSS px
    - **THEN** it shows the labelled bottom navigation Today, Train, Fuel, Coach, and Grow with targets at least 44 × 44 CSS px.
  - Scenario: Route reload
    - **WHEN** a browser reloads `/fuel`
    - **THEN** the Nutrition placeholder reappears with its named heading and required message.
- **Requirement: Inert welcome orientation**
  - The welcome route SHALL show the approved copy, Sage, Atlas, Nova, Dash, Cleo, and Luna plus visibly inactive Google and demo actions.
  - Scenario: Signed-out welcome
    - **WHEN** a signed-out user opens `/`
    - **THEN** the welcome screen shows the required personas and activating either future-entry action causes no navigation, API request, identity-provider request, or external side effect.
- **Requirement: Accessible fallback and dialog primitives**
  - Unknown routes SHALL render Page not found with a keyboard-operable start link, and the shared Dialog SHALL trap focus, close on Escape, and restore focus to its trigger.
  - Scenario: Dialog keyboard exit
    - **WHEN** a keyboard user opens a Dialog and presses Escape
    - **THEN** the Dialog closes and focus returns to its opener.

### Requirement Coverage
FR-006–FR-008 and FR-010, including responsive navigation, required placeholders, welcome content, dialog behavior, and unknown-route recovery.

### Evidence
Playwright/axe results at 360, 768, and 1440 px; named AC tests for route reload, labels, welcome content, keyboard navigation, start link, and dialog focus restoration.

### Demonstrates Reference Scenarios
RS-005, RS-006, RS-007, RS-008, RS-009; SCR-1, SCR-2, SCR-3, SCR-4, SCR-5, SCR-6, SCR-7; CMP-1, CMP-2, CMP-3, CMP-4, CMP-5, CMP-6, CMP-7, CMP-8, CMP-9.

### NFRs
- NFR-A11Y-001, NFR-A11Y-002, NFR-A11Y-003, NFR-UX-001, NFR-PERF-004.

### Constraints
- Import `design-system/opengym/tokens.css` first at the web entry point; use CSS Modules and tokens only; light theme only.

### Assumptions
- Approved persona artwork or an approved non-extracted implementation approach is available before final welcome implementation.

### Contracts / Interfaces
React Router routes, responsive navigation labels, token CSS import, shared Dialog interface.

### API Surface (indicative)
None; this increment's shell does not fetch data.

### Data owned
None.

### Events published
None.

### Events consumed
Browser route and viewport state only.

### Implementation Notes
Do not reproduce prototype-only text or known prototype defects. Future data states belong to later data-bearing features, not these static placeholders.

### Out of scope for this capability
- Authentication redirects, dark theme, data fetching, journal UI, and an actual Dialog-triggering workflow.

---

## CAP-4 — Same-Origin Containerized Development Runtime

**Depends on:** CAP-2, CAP-3
**Owning service:** Delivery
**Satisfies:** FR-002
**Governed by:** ADR-001
**Domain:** `local-runtime`

### Summary
Package the web, API, and PostgreSQL foundation into a reproducible Docker Compose development stack where the web container proxies `/api` to the matched API. This is the local runtime, not a production platform choice.

### Requirements (ADDED)

- **Requirement: One-origin local stack**
  - Docker Compose SHALL start PostgreSQL, API, and web, expose the web at `localhost:8080`, and route browser API traffic under `/api` to the API container.
  - Scenario: Local smoke test
    - **WHEN** Docker is running and a developer starts the Compose stack
    - **THEN** the web responds at `localhost:8080` and `/api/v1/health` returns 200 through the same origin.
- **Requirement: Configuration boundary**
  - Runtime configuration and secrets SHALL be supplied by environment variables, and only the API container SHALL receive database access configuration.
  - Scenario: Browser data-boundary check
    - **WHEN** the web container is inspected for database configuration
    - **THEN** it has no `DATABASE_URL` and browser traffic reaches PostgreSQL only through the API.

### Requirement Coverage
FR-002 and the technical design's mandated local Docker topology and same-origin deployment boundary.

### Evidence
Compose build/start logs, same-origin health smoke test, and container environment/configuration inspection.

### Demonstrates Reference Scenarios
RS-002.

### NFRs
- NFR-OPS-001 and NFR-SEC-005.

### Constraints
- PostgreSQL 16; web/API matched pair; no CORS-dependent separate browser origin.

### Assumptions
- Docker runtime is available to local developers and CI.

### Contracts / Interfaces
`docker-compose.yml`, container build definitions, `/api` reverse-proxy path, environment variable contract.

### API Surface (indicative)
Consumes CAP-2 health and readiness endpoints through `/api`.

### Data owned
Local PostgreSQL volume only; no seeded journal/demo data.

### Events published
None.

### Events consumed
API and database container readiness.

### Implementation Notes
Do not select a new SIT host or bake secret values into images.

### Out of scope for this capability
- SIT host provisioning, UAT/production runtime, release strategy, and external integration containers.

---

## CAP-5 — CI Quality Gates and DEV-to-SIT Promotion Evidence

**Depends on:** CAP-4
**Owning service:** Delivery
**Satisfies:** FR-009
**Governed by:** ADR-001
**Domain:** `delivery-pipeline`

### Summary
Implement GitLab CI to verify the foundation and build a matched release pair once on integration commits, retaining evidence and supporting manual same-tag promotion through DEV then SIT. It does not automate UAT or production rollout.

### Requirements (ADDED)

- **Requirement: Foundation quality evidence**
  - GitLab CI SHALL run lint, typecheck, tests and coverage, migration checks, Playwright/axe checks, dependency scanning, CycloneDX SBOM generation, Lighthouse, and applicable health-endpoint k6 checks.
  - Scenario: Integration quality gate
    - **WHEN** an integration-branch commit enters the pipeline
    - **THEN** CI retains test, migration, vulnerability, SBOM, Lighthouse, and load-test evidence and fails on mandated gate failure.
- **Requirement: Immutable promotion pair**
  - CI SHALL build the web/API release pair once per integration commit with the same immutable tag, and manual release procedure SHALL deploy that exact pair to DEV before SIT after migrations run separately.
  - Scenario: Same-image promotion
    - **WHEN** a successful release is promoted from DEV to SIT
    - **THEN** the web and API artifacts retain the integration commit tag and are not rebuilt between environments.

### Requirement Coverage
FR-009, delivery/release requirements, and TDD-01 §§7–8 quality and promotion rules.

### Evidence
GitLab pipeline configuration and retained artifacts for quality gates, SBOM, scan, immutable tags, migration execution, and DEV/SIT smoke checks.

### Demonstrates Reference Scenarios
Not applicable: this delivery capability has no UI-facing or decision-output reference scenario in the FRD.

### NFRs
- NFR-SEC-005, NFR-SEC-009, NFR-OPS-003, NFR-A11Y-001, NFR-PERF-004.

### Constraints
- Apply migrations before new API start; same tag across DEV and SIT; SIT uses the documented Compose-on-shared-VM fallback until a host is selected.

### Assumptions
- GitLab runners, artifact storage, image registry, and shared-VM access are available.

### Contracts / Interfaces
`.gitlab-ci.yml`, artifact retention, immutable image tag convention, and manual DEV/SIT deployment record.

### API Surface (indicative)
Exercises CAP-2 endpoints for smoke/load validation.

### Data owned
CI artifacts and deployment evidence; no application data.

### Events published
Build and deployment evidence artifacts.

### Events consumed
Source commit, container images, migration artifacts, and environment configuration.

### Implementation Notes
Stop deployment if migration fails; favor forward corrective migration rather than unsafe schema rollback.

### Out of scope for this capability
- UAT/production deployment, container-host selection, rolling/blue-green/canary strategy, backup/restore, and production runbooks.

---

## Cross-Cutting Concerns

- All application code uses strict TypeScript, mandatory stack tools, shared Zod contracts, and additive feature boundaries.
- Secrets are environment-only and redacted from logs; API JSON logs include request IDs but not future journal/AI content.
- Tests use real PostgreSQL with unique databases/free ports; acceptance tests include their AC identifiers.
- Every UI surface uses the approved tokens, CSS Modules, semantic keyboard operation, visible focus, and responsive no-horizontal-scroll checks.
- No capability may activate OIDC, demo account creation, Google, Anthropic, AI, or journal behavior in FRD-01.

## Dependency Order (Suggested Implementation Sequence)

Wave 1 (no prerequisites): CAP-1
Wave 2 (depends on Wave 1): CAP-2, CAP-3
Wave 3 (depends on Wave 2): CAP-4
Wave 4 (depends on Wave 3): CAP-5

## Summary Table

| ID | Capability | Depends on | Service | FRs |
|---|---|---|---|---|
| CAP-1 | Workspace and Shared Contract Foundation | — | Platform | FR-001 |
| CAP-2 | API Security, Readiness, and Initial Data Foundation | CAP-1 | API | FR-003, FR-004, FR-005 |
| CAP-3 | Signed-Out Responsive Web Shell and Accessible Primitives | CAP-1 | Web | FR-006, FR-007, FR-008, FR-010 |
| CAP-4 | Same-Origin Containerized Development Runtime | CAP-2, CAP-3 | Delivery | FR-002 |
| CAP-5 | CI Quality Gates and DEV-to-SIT Promotion Evidence | CAP-4 | Delivery | FR-009 |
