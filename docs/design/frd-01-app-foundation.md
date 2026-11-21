# FRD-01 App Foundation — Technical Design

## Overview

FRD-01 establishes the greenfield OpenGym foundation: a pnpm workspace containing the React web shell, Fastify API, PostgreSQL migration foundation, Docker Compose development stack, and CI quality gates. It delivers a signed-out, responsive shell and operational API surfaces only; authentication, journal behavior, AI calls, and Google integrations remain deferred.

## Background / Context

`docs/source/TDD-01.md` is the binding project-level technical authority. It mandates TypeScript, React 19/Vite 6, Fastify 5, shared Zod schemas, PostgreSQL 16 with Drizzle SQL migrations, Docker/Compose, and GitLab CI; this design does not override those rules. `docs/requirement/frd-01-app-foundation.md` supplies FR-001–FR-010 and the measurable NFR baseline; `docs/source/SRS-01.md` supplies the navigation, accessibility, API, and future-scope constraints.

No prior feature implementation, ADRs, C4 diagrams, API contract, or migrations exist. OpenSpec is initialized in `openspec/config.yaml` but has no feature change artifacts. This is therefore a greenfield feature design, not a design against existing application behavior. The project-level logical topology is Browser → Fastify API → PostgreSQL; the API is the sole database boundary and the browser sees web and API under one origin.

Baseline review identified a shared-Linux-VM Docker Compose fallback for SIT in `docs/source/TDD-01.md` §7. The container-host selection is deliberately deferred to TDD-OI-01; FRD-01 must not introduce a different topology. No external integration is invoked in this increment: Google OIDC, Google Sheets, and Anthropic remain future work.

## Goals

- Deliver the mandated workspace structure and root install, lint, typecheck, test, and build commands (FR-001).
- Supply a reproducible Docker Compose stack with PostgreSQL, API, and web under one local origin (FR-002).
- Establish API request IDs, structured errors/logging, health/readiness, security headers, input validation, and IP-based rate limiting (FR-003, FR-004).
- Create the initial versioned `users` migration (FR-005).
- Deliver the responsive navigation, welcome, placeholders, inaccessible future actions, dialog behavior, and not-found route (FR-006–FR-008, FR-010).
- Build once and retain evidence for manually promoting the matched web/API release pair to DEV then SIT (FR-009).

## Non-Goals

- Google sign-in, sessions, authenticated authorization, CSRF, real demo journals, and user creation behavior.
- Journal, workout, nutrition, recovery, persona, quest, AI, Google Sheets, or account-settings behavior.
- Calls to Google, Anthropic, or any other external service, and their credentials.
- UAT or production deployment, host selection, production rollout policy, backup/restore, RPO/RTO, alerting, or support-hour commitments.

## Proposed Design

### Repository and component boundaries

Create the mandated pnpm workspace layout from `docs/source/TDD-01.md` §2: `apps/web`, `apps/api`, and `packages/shared`, plus `e2e`, `load`, root `docker-compose.yml`, and `.gitlab-ci.yml`. `packages/shared` owns shared Zod schemas and API types and imports neither application. The web application imports no API implementation; it calls only the API under `/api/v1`.

The web container/static server serves the SPA and proxies `/api` to the API container so browser traffic remains same-origin. The API is the only process with `DATABASE_URL` access. The API has no routes that invoke Google, Sheets, Anthropic, or an identity provider in this increment.

### API foundation

The Fastify application registers request-ID, structured-error, security-header, rate-limit, database, and logging plugins. Every response carries `x-request-id`; every emitted pino record is valid JSON and includes that identifier. The error envelope is the TDD-01 §3.1 shape:

```json
{ "error": { "code": "VALIDATION_FAILED", "message": "...", "fields": {} } }
```

`GET /api/v1/health` returns 200 when the process is live. `GET /api/v1/ready` checks PostgreSQL and returns 200 when reachable; on database failure it returns 503 with `DATABASE_UNAVAILABLE`. Shared Zod schemas validate any API input and invalid input returns 400 with field errors. General traffic is limited to 300 requests per minute per source IP until a session identity exists; the 301st request in the minute returns 429.

Send CSP and `X-Content-Type-Options: nosniff` in all applicable responses, and HSTS in SIT. Security-header policy must allow only resources necessary for this foundation and must not introduce third-party origins. Secrets are only read from environment configuration and never logged or committed.

### Data and migration

Drizzle schema and timestamp-prefixed SQL migrations live in the API database area mandated by TDD-01 §2. The initial migration creates `users` from an empty PostgreSQL 16 database with UUID v7 primary key, unique email, display name, IANA time zone, UTC creation timestamp, and `is_demo BOOLEAN NOT NULL DEFAULT false`. Migration filenames begin `YYYYMMDDHHMMSS_` to avoid parallel-branch collisions.

No journal table, user seed, demo data, or legacy-data migration is part of FRD-01. The migration is additive for this greenfield release. Its application is a separate release action before the new API starts; failure stops the release and is recovered forward with a reviewed follow-up migration rather than an unsafe schema rollback.

### Web shell and accessibility

The React router renders `/`, `/today`, `/train`, `/fuel`, `/coach`, and `/grow`; browser reload preserves the requested known route. At widths of at least 768 CSS px it renders the required top navigation labels; below 768 CSS px it renders the required bottom labels. Each route uses a named placeholder with the required “This part of your journal is on its way” message. Unknown routes render Page not found with a start link.

The welcome route renders the specified product copy, Sage, Atlas, Nova, Dash, Cleo, and Luna, plus visibly inactive Google and demo actions. Inactive means no navigation, API call, identity-provider request, or external integration is triggered. Shared visual primitives use CSS Modules and design tokens only. The shared Dialog traps focus, closes on Escape, and restores focus to its trigger. All navigation remains keyboard operable; bottom-nav targets are at least 44×44 CSS px.

### CI, images, and evidence

GitLab CI runs the quality gates mandated by TDD-01 §8: lint, typecheck, tests and coverage, migration checks against empty and preceding schemas, Playwright/axe checks, dependency scan, CycloneDX SBOM generation, Lighthouse, and applicable k6 health-endpoint testing. The integration-branch release build produces the web/API release pair once, identifies both artifacts with the same immutable integration-commit tag, and retains the tag, SBOM, vulnerability result, and test evidence. The exact same pair is manually deployed to DEV before SIT; it is never rebuilt between environments.

## Alternatives Considered

| Alternative | Decision |
| --- | --- |
| Separate browser-facing API origin | Rejected: violates the mandated single-origin `/api` deployment and adds CORS/session complexity before authentication exists. |
| Browser access directly to PostgreSQL | Rejected: violates the API-only data boundary and exposes database credentials/data. |
| Add Google/OIDC, demo, Sheets, or AI placeholders backed by live calls | Rejected: FRD-01 explicitly defers these integrations and requires welcome actions to remain inactive. |
| Use a non-versioned ORM schema push | Rejected: violates FR-005, BR-002, and NFR-OPS-003. |
| Select a new SIT platform now | Rejected: host selection is TDD-OI-01; FRD-01 uses the documented Compose-on-shared-VM fallback for SIT. |

## Data Model / API Changes

| Element | Change | Contract / constraint |
| --- | --- | --- |
| `users` | Initial PostgreSQL table | UUID v7 `id`; unique `email`; `display_name`; IANA `time_zone`; UTC `created_at`; `is_demo BOOLEAN NOT NULL DEFAULT false`. |
| `GET /api/v1/health` | New liveness endpoint | 200 for a live API process. |
| `GET /api/v1/ready` | New readiness endpoint | 200 only with reachable PostgreSQL; otherwise 503 `DATABASE_UNAVAILABLE`. |
| API responses | Foundation middleware | `x-request-id`, JSON error envelope, CSP/nosniff; HSTS in SIT; 300/minute/IP general limit. |
| Browser routes | New shell routes | `/`, `/today`, `/train`, `/fuel`, `/coach`, `/grow`, plus fallback not-found screen. |

The health and readiness endpoints return bounded objects, not collections; pagination is therefore not applicable. No authenticated or user-data API is exposed by this increment.

## Non-Functional Requirements

| ID | Measurable target | Measured how / environment | Source |
| --- | --- | --- | --- |
| NFR-SEC-003 | Invalid API input returns 400 with field errors. | Automated API invalid-request tests in DEV/SIT CI. | FRD-01 |
| NFR-SEC-004 | CSP, `X-Content-Type-Options: nosniff`, and HSTS in SIT are present on applicable API responses. | Automated response-header tests in SIT CI. | FRD-01 |
| NFR-SEC-005 | Secret scan finds zero secrets on every integration commit. | CI secret scan and configuration review. | FRD-01 |
| NFR-SEC-006 | General API limit is 300 requests/minute/IP before sessions; request 301 is 429. | Automated API rate-limit test in DEV/SIT CI. | FRD-01 |
| NFR-SEC-009 | Release dependency scan reports zero known critical/high findings and emits a CycloneDX SBOM. | CI dependency scan and release artifact inspection. | FRD-01 |
| NFR-A11Y-001 | Welcome and all five placeholders have zero axe level-A/AA violations. | Playwright plus axe in CI. | FRD-01 |
| NFR-A11Y-002 | Navigation is operable by Tab/Enter; Dialog traps and restores focus. | Playwright keyboard tests in CI. | FRD-01 |
| NFR-A11Y-003 | Each bottom-navigation item is at least 44×44 CSS px. | Playwright narrow-viewport measurement in CI. | FRD-01 |
| NFR-UX-001 | No horizontal scroll at 360, 768, and 1440 CSS px in the light theme. | Playwright layout tests in CI. | FRD-01 |
| NFR-PERF-004 | Welcome-page LCP is at most 2.5 seconds on Lighthouse mobile simulated 4G. | Lighthouse CI/SIT run. | FRD-01 |
| NFR-OPS-001 | `/health` is 200 with a live process; `/ready` is 200 only with DB and 503 without it. | API tests and DEV/SIT smoke checks. | FRD-01 |
| NFR-OPS-002 | Each API log line is valid JSON and includes a request ID. | API/log assertion in DEV/SIT CI. | FRD-01 |
| NFR-OPS-003 | Every database change is a versioned timestamp-prefixed SQL migration. | Repository review and migration gate in CI/SIT. | FRD-01 |

## Testing Strategy

- Unit-test shared schemas, error mapping, request IDs, security headers, rate-limit behavior, migration naming, and Dialog behavior.
- Use Fastify `inject` and real PostgreSQL for API integration tests, including readiness with the database available and unavailable, 301st-request rejection, and log/request-ID correlation.
- Apply migrations to an empty database and the preceding schema in CI. Tests that create datastore records use isolated temporary databases and clean up their own data.
- Execute Playwright tests named with AC-01 IDs for routes, reload behavior, wide/narrow labels, welcome content, not-found route, keyboard navigation, and focus restoration; run axe checks for all changed screens.
- Run Lighthouse for the welcome page and an appropriate k6 check for the new health endpoint against the stated target where applicable. Retain CI results, SBOM, scan evidence, migration output, and manual DEV/SIT smoke evidence.

## Rollout Plan

### Deployment (manual)

**How this is deployed today.** The repository has no README, deployment runbook, or CI deployment workflow. The governing documented practice is `docs/source/TDD-01.md` §§7–8: DEV runs through Docker Compose; SIT uses a Docker Compose stack on the shared Linux VM fallback until a container host is selected; web and API run as the same-origin matched image pair; an integration-branch build is promoted with the same tag; and migrations run separately before the new API starts.

**Manual DEV then SIT procedure.**

1. Select the immutable web/API release pair from one successful integration-branch build. Confirm its shared commit tag, passing quality-gate evidence, CycloneDX SBOM, and dependency scan. Do not rebuild either member between DEV and SIT.
2. Prepare the DEV environment configuration by setting the named variables below through the team’s approved environment/secret mechanism; do not commit values. Ensure DEV PostgreSQL is reachable from the API and the web proxy maps `/api` to the matched API.
3. Run the versioned SQL migrations against the target DEV database as a distinct step. Verify the migration completed and `users.is_demo` defaults to false. If it fails, stop before starting the new API; diagnose and recover with a reviewed forward migration.
4. Start or update the matched API and web pair in DEV. Smoke-check `/api/v1/health`, `/api/v1/ready`, the one-origin web route, request-ID logging, and the required header behavior.
5. After DEV evidence is retained, repeat steps 2–4 for SIT using the identical release pair and the distinct SIT database/ports on the documented shared-VM Compose fallback. Verify HSTS in SIT as part of the header smoke check.
6. Do not attempt a schema rollback after a successful migration unless DevOps has assessed it as safe. Roll back application containers only to a release compatible with the current schema; otherwise create and apply a forward corrective migration.

**Required configuration and secret names.** `APP_ENV` (`dev` or `sit`), `DATABASE_URL`, `SESSION_SECRET`, and `PUBLIC_BASE_URL` are required configuration for this foundation. `AUTH_TEST_PROVIDER` may be set only to `true` in DEV/SIT when the local stub is used. `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OIDC_REDIRECT_URI`, `ANTHROPIC_API_KEY`, and `AI_GATEWAY` are defined by the project baseline for later integrations but are not required for FRD-01 because no sign-in or AI route is enabled. All secret values remain outside the repository and logs.

## Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| SIT VM access, registry/image availability, or distinct database/ports are unavailable | Treat these as preconditions for the manual SIT release; retain DEV evidence and stop before SIT rather than substituting a new topology. |
| A migration failure or incompatible rollback leaves application/schema versions mismatched | Run migrations separately before API start, verify them, and use forward recovery unless a rollback is assessed safe. |
| Future integrations accidentally become live through welcome actions or configuration | Keep actions inert, expose no integration routes, and omit integration secrets from FRD-01 deployment needs. |
| Foundation shared files become difficult for later FRDs to extend | Keep feature modules and shared-index edits additive as required by TDD-01 §2. |
| Security controls are weakened because authentication is deferred | Enforce server validation, headers, request IDs, secrets discipline, IP limits, scans, and no direct browser-to-database path now. |

## Open Questions

- TDD-OI-01 / DEC-001: Product Owner and DevOps must select a container host before real-traffic SIT; FRD-01 uses the documented shared-VM fallback only.
- Production release strategy, production approval policy, maintenance window, and rollback policy remain outside FRD-01 and must be decided before production.
- Retention, backup/restore, RPO/RTO, alerting, operational ownership, and support hours are not specified and are required before production, not before this DEV/SIT foundation release.
