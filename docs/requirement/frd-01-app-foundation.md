# FRD-01 App Foundation — End-to-End Discovery and Requirements Baseline

## Document Control

| Field | Value |
| --- | --- |
| Title | FRD-01 App Foundation |
| Version | 1.0 |
| Status | Baseline complete; ready for Architecture |
| Date | 2026-11-21 |
| Prepared from | FRD-01 App Foundation; BRD-01; SRS-01; TDD-01; Product Owner clarifications (2026-11-21) |
| Owners and approvers | Product Owner owns business acceptance, UAT/go-live acceptance, and business-dispute resolution. Analysis-gate approver: the project's Architect, in the IRIS Console. |

## Run Configuration Answers

No run-configuration answers found in source. The environment ladder DEV → SIT → UAT is a product delivery constraint, not a complete deployment-intake answer.

## Executive Summary

FRD-01 establishes the greenfield OpenGym application foundation: repository, web shell, API health/readiness surface, initial PostgreSQL migration, shared UI primitives, CI quality gates, and deployment to DEV and SIT. It deliberately excludes functional sign-in, sessions, journal features, AI use, and Google Sheets export; visible welcome actions are inactive in this increment. The project-level TDD mandates the technical stack and delivery rules. The Product Owner has confirmed no additional privacy, regulatory, data-classification, residency, schedule, or budget constraint beyond the supplied sources; UAT/go-live authority rests with that role.

**Readiness summary:** Ready for Architecture; remaining choices are owned downstream implementation or deployment details, not unresolved requirement blockers.

## Business Context and Success Measures

- **Business problem and outcome** — OpenGym is a personal web-based training journal for movement, nourishment, and recovery, intended to present a calm, non-judgemental view of a person's logged habits. FRD-01 creates the reusable and deployable foundation on which later increments deliver that outcome. Status: Confirmed.
- **Foundation success** — A clean clone can install and build; local Docker starts web/API/database; DEV and SIT receive the same built image; defined automated quality gates pass. Status: Confirmed.
- **Product success context** — Later product outcomes include fast workout logging, voluntary repeat use, consistent numbers across screens, user data control, and AI answers based only on logged records (BRD-01 §2). These are contextual drivers, not all FRD-01 deliverables. Status: Confirmed.
- **Schedule and budget** — No fixed deadline, milestone, or budget constraint is known. Status: Confirmed (Product Owner clarification, 2026-11-21).
- **Additional regulatory/privacy/residency constraints** — None are known beyond the supplied requirements. Existing privacy/security requirements remain binding. Status: Confirmed (Product Owner clarification, 2026-11-21).

## Stakeholders, Users, Roles and Personas

- **Product Owner** — owns requirements, business disputes, UAT acceptance, and go-live acceptance. Status: Confirmed.
- **Journal user** — adult training at a gym or home; uses phone during workouts and phone or laptop otherwise. FRD-01 supplies only the signed-out shell experience. Status: Confirmed.
- **Demo visitor** — prospective user of a sample journal; no demo journal behavior is delivered in FRD-01, although `users.is_demo` is included in the initial migration. Status: Confirmed.
- **Developer / delivery team** — needs reproducible local tooling, CI, and DEV/SIT deployment. Status: Confirmed.
- **No administrator or social-user role** — no administrator users, social features, sharing, or leaderboards in the release scope. Status: Confirmed.

## Scope

### In Scope

- Repository layout, pnpm workspace tooling, and root commands specified by FRD-01 §2.1 and TDD-01 §1–2. Status: Mandated.
- Fastify API foundation: error handling, request ID, structured logging, security headers, rate limiting, `/health`, and `/ready`. Status: Mandated.
- PostgreSQL connection, versioned migration setup, and initial `users` table including `is_demo BOOLEAN DEFAULT false`. Status: Mandated.
- React web shell, header, responsive five-item navigation, routes and placeholder screens, welcome screen, light/Peach tokens, and listed shared UI components. Status: Mandated.
- Docker Compose DEV stack, GitLab CI quality gates, single-image promotion, and deployment to DEV and SIT. Status: Mandated.

### Out of Scope

- Sign-in/session behavior (FRD-02), dark theme and alternate accents (FRD-07), and all journal features. Status: Confirmed.
- AI service calls, Google OIDC sign-in, and Google Sheets export in this increment. Status: Confirmed.

### Future Scope

- Product capabilities in BRD-01/SRS-01, including sign-in, journals, AI, and exports, are delivered by later FRDs. Status: Deferred; owner: Product Owner / later FRD owners.

## Current State

Greenfield increment. No implemented application behavior is in scope to preserve. The supplied prototype is a visual reference only; known prototype defects in BRD-01 §7 must not be reproduced. Status: Confirmed.

## User Journeys and Business Workflows

- **JRN-001: Signed-out orientation** — A journal user opens OpenGym on phone or laptop, sees the calm welcome screen, header, message, six persona figures, and inactive future-entry buttons. Status: Confirmed.
- **JRN-002: Shell navigation** — A user opens any of the five main routes, sees its placeholder, and can reload without losing the route; navigation placement and labels adapt at 768 px. Status: Confirmed.
- **JRN-003: Foundation delivery** — A developer commits to the integration branch; CI runs required gates, produces an SBOM and one image, then promotes that image to DEV and SIT. Status: Confirmed.
- **JRN-004: Health diagnosis** — An operator or automated check calls health/readiness endpoints to distinguish a live API process from an unavailable database. Status: Confirmed.

## Functional Requirements

| ID | Requirement | Source | Stakeholder | Journey | Acceptance Criterion | Status |
| --- | --- | --- | --- | --- | --- | --- |
| FR-001 | Repository follows mandated workspace layout; root install, lint, typecheck, test, and build commands work. | FRD-01 FR-01-01–02; TDD-01 §1–2 | Delivery team | JRN-003 | AC-01-01; CI quality gates | Mandated |
| FR-002 | Docker Compose starts PostgreSQL, API, and web; web is available at localhost:8080 with API under `/api`. | FRD-01 FR-01-03 | Developer | JRN-003 | AC-01-02 | Confirmed |
| FR-003 | API exposes health/readiness behavior and the specified structured error format with an `x-request-id` header. | FRD-01 FR-01-04–05; TDD-01 §3.1 | Operations | JRN-004 | AC-01-03–05 | Mandated |
| FR-004 | API applies baseline security headers and IP-based general rate limiting until session identity exists. | FRD-01 FR-01-06–07; SRS-01 NFR-SEC-04/06 | Security | JRN-004 | NAC-01-01–04 | Mandated |
| FR-005 | Versioned migrations create `users` from an empty database with UUID v7 ID, unique email, display name, IANA time zone, created time, and `is_demo` defaulting false. | FRD-01 FR-01-08 §6; TDD-01 §3.2; PO clarification | Data | JRN-003 | AC-01-06 | Mandated |
| FR-006 | Web shell has header and five responsive navigation items; each route has a reload-safe named placeholder. | FRD-01 FR-01-09–10; SRS-NAV-01/02 | Journal user | JRN-002 | AC-01-07–10 | Mandated |
| FR-007 | Welcome screen presents specified product copy, six named persona figures, and visible inactive Google/demo actions. | FRD-01 FR-01-11; SRS-AUTH-05 | Journal user | JRN-001 | AC-01-11 | Confirmed |
| FR-008 | Shared Dialog traps focus, closes on Escape, and restores focus to its trigger. | FRD-01 FR-01-12 | All users | JRN-001/JRN-002 | AC-01-12 | Mandated |
| FR-009 | CI runs mandated quality gates, produces CycloneDX SBOM, builds images once per commit, and deploys the same tag to DEV and SIT. | FRD-01 FR-01-13; TDD-01 §8 | Delivery team | JRN-003 | AC-01-13 | Mandated |
| FR-010 | Unknown browser routes show a Page not found screen with a start link. | FRD-01 FR-01-14 | Journal user | JRN-002 | AC-01-10 | Confirmed |

## Reference Scenarios

| ID | Actors | Trigger / Input | Expected Observable Outcome | Source |
| --- | --- | --- | --- |
| RS-001 | Developer | Clean clone; run `pnpm install` then `pnpm build` | Both finish with exit code 0. | FRD-01 AC-01-01 |
| RS-002 | Developer | Docker is running; run `docker compose up` | Web answers at localhost:8080 and `/api/v1/health` returns 200. | FRD-01 AC-01-02 |
| RS-003 | Operator | Database container stopped; call `/api/v1/ready` | 503 with `DATABASE_UNAVAILABLE`. | FRD-01 AC-01-03 |
| RS-004 | API consumer | Send any API request | Response has `x-request-id`; matching log line has `request_id`. | FRD-01 AC-01-04 |
| RS-005 | Browser user | At 1280 px, open app | Top navigation labels are Daily Overview, Workouts, Nutrition, AI Coach, Seasons & Quests. | FRD-01 AC-01-07 |
| RS-006 | Browser user | At 375 px, open app | Bottom labels are Today, Train, Fuel, Coach, Grow. | FRD-01 AC-01-08 |
| RS-007 | Browser user | Reload `/fuel` | `/fuel` reappears. | FRD-01 AC-01-09 |
| RS-008 | Signed-out user | Open `/` | Welcome screen shows required text and Sage, Atlas, Nova, Dash, Cleo, Luna. | FRD-01 AC-01-11 |
| RS-009 | Keyboard user | Open a dialog then press Escape | Dialog closes and focus returns to opener. | FRD-01 AC-01-12 |

## Business Rules

| ID | Rule | Source | Status |
| --- | --- | --- | --- |
| BR-001 | `users.is_demo` is boolean and defaults to false; later demo users are distinct from real accounts. | FRD-01 §6; BRD-01 BR-27; TDD-01 §4 | Mandated |
| BR-002 | Migration file names use timestamp prefixes to avoid parallel-branch collisions. | FRD-01 §6; TDD-01 §3.2 | Mandated |
| BR-003 | The prototype is visual reference only; its listed incorrect totals, isolation, persona progress, and duplicate-usual behavior are not acceptable product behavior. | BRD-01 §7 | Mandated |

## Data Requirements

- **Initial user schema** — `users` contains UUID v7 ID, unique email, display name, IANA time zone, `created_at`, and `is_demo` default false. Migration must succeed from an empty database. Status: Mandated.
- **Data ownership and isolation context** — Later journal tables require `user_id` ownership and cascade deletion; FRD-01 creates only the foundation required for this future constraint. Status: Mandated.
- **Time representation** — Future timestamps are UTC and journal days are time-zone-derived; initial user time zone is an IANA name. Status: Mandated.
- **Retention/backup/RPO/RTO** — No requirement or target is supplied for this increment. Status: Open – Non-blocking; owner: Product Owner and DevOps; target stage: architecture/release planning.

## Integration Requirements

- **Known external integrations** — Only Google OpenID Connect, Google Sheets export, and Anthropic AI are known integrations; none is invoked by FRD-01. Status: Confirmed (Product Owner clarification, 2026-11-21).
- **Google OpenID Connect** — Future authentication is Google OIDC authorization-code flow with PKCE; no sign-in behavior is delivered here. Status: Mandated; owner: FRD-02.
- **Google Sheets** — Future export-only integration; sheet edits are not imported. Status: Mandated; owner: later data-control FRD.
- **Anthropic AI** — Future AI integration is confined to the API gateway; no AI service use or key is required in FRD-01. Status: Mandated; owner: later AI FRDs.

## UI/UX and Accessibility Requirements

- **Channels and responsive navigation** — Responsive web supports wide and narrow views; top navigation at ≥768 px and bottom navigation at <768 px. Status: Mandated.
- **Welcome experience** — Warm neutral background, soft cards, rounded corners, specified copy and six figures; prototype guides visual language but is not behavioral authority. Status: Confirmed.
- **Placeholders and error state** — Each main route names its screen and states “This part of your journal is on its way”; unknown route offers Page not found and a start link. Status: Confirmed.
- **Accessibility** — WCAG 2.2 AA, keyboard navigation, dialog focus behavior, 44×44 CSS-px mobile targets, and no horizontal scroll 360–1440 px apply. Status: Mandated.
- **Language and browser support** — English only; latest two versions of Chrome, Edge, Firefox, and Safari on desktop/mobile. Status: Mandated.

## Security, Privacy and Compliance Requirements

| ID | Requirement | Driver (regulation / policy / risk) | Evidence Needed | Status |
| --- | --- | --- | --- | --- |
| SEC-001 | Validate API input server-side with shared schemas; invalid input returns 400 with field errors. | SRS NFR-SEC-03 | API tests for valid/invalid requests | Mandated |
| SEC-002 | Send CSP, HSTS in SIT, and `X-Content-Type-Options: nosniff`. | SRS NFR-SEC-04 | API response-header tests | Mandated |
| SEC-003 | Store secrets only in environment configuration; repository secret scan finds none. | SRS NFR-SEC-05 | CI scan evidence and configuration review | Mandated |
| SEC-004 | Apply 300 requests/minute general limit by IP until user sessions exist; 301st request returns 429. | FRD-01; SRS NFR-SEC-06 | API rate-limit test | Mandated |
| SEC-005 | Release dependency scan has no critical/high findings and supplies an SBOM. | SRS NFR-SEC-09; TDD-01 §8 | CI scan and CycloneDX artifact | Mandated |
| SEC-006 | No additional privacy, classification, residency, or regulatory constraint is known beyond supplied requirements. This is not a compliance certification. | PO clarification | Traceable PO clarification; future review if processing changes | Confirmed |

## Non-Functional Requirements

| ID | Metric | Target | Measurement Point | Workload / Condition | Validation Method | Environment | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-SEC-003 | Input validation | Invalid API input returns 400 and field errors | API boundary | Invalid request cases | Automated API tests | DEV/SIT CI | Development + Security | Mandated |
| NFR-SEC-004 | Security headers | CSP, HSTS (SIT), `nosniff` present | API response | Health and applicable API calls | Automated API test | SIT CI | Development + Security | Mandated |
| NFR-SEC-005 | Secret exposure | Zero secrets found | Source and CI | Every integration commit | CI secret scan | CI | Development + Security | Mandated |
| NFR-SEC-006 | General rate limit | 300/minute/IP; request 301 is 429 | API rate limiter | One IP in one minute, before sessions | Automated API test | DEV/SIT CI | Development + Security | Mandated |
| NFR-SEC-009 | Dependency vulnerability | Zero known critical/high findings at release | Dependency scan | Every integration commit/release build | CI scan | CI | Development + Security | Mandated |
| NFR-A11Y-001 | Automated accessibility | Zero axe A/AA violations on welcome and five placeholders | Rendered pages | Light theme | Playwright + axe | CI | UX + QA | Mandated |
| NFR-A11Y-002 | Keyboard operation | All navigation operates via Tab/Enter; Dialog focus trap/return works | Browser interaction | Changed screens/components | Playwright | CI | UX + QA | Mandated |
| NFR-A11Y-003 | Touch target | Bottom-nav items ≥44×44 CSS px | Rendered mobile UI | Narrow viewport | Playwright measurement | CI | UX + QA | Mandated |
| NFR-UX-001 | Responsive layout | No horizontal scrolling at 360, 768, 1440 px | Rendered pages | Light theme | Playwright | CI | UX + QA | Mandated |
| NFR-PERF-004 | Largest Contentful Paint | ≤2.5 s | Welcome page | Lighthouse mobile, simulated 4G | Lighthouse CI | CI/SIT | Development + QA | Mandated |
| NFR-OPS-001 | Liveness/readiness | Health is 200 when process runs; readiness is 200 only with DB and 503 without it | API endpoints | Normal and DB-unavailable states | API tests/smoke checks | DEV/SIT | DevOps + Operations | Mandated |
| NFR-OPS-002 | Structured logging | Every log line valid JSON with request ID | API log stream | API request execution | API/log assertion | DEV/SIT CI | Development + Operations | Mandated |
| NFR-OPS-003 | Database change control | All DB changes are versioned migrations | Repository/database | Schema creation and later change | Migration CI gate | CI/SIT | Development + Data | Mandated |

## Architecture-Driving Requirements and Constraints

- **Project-level technical rules** — The architecture must comply with the TDD-01 stack, workspace boundaries, API conventions, data rules, configuration model, and quality gates. A feature-level ADR/TDD may not override TDD-01. Status: Mandated.
- **Service boundary** — Browser communicates only with OpenGym API; API alone accesses PostgreSQL and future AI services. Status: Mandated.
- **Single-origin deployment** — DEV/SIT/UAT must serve web and API under one origin with API under `/api`. Status: Mandated.
- **Extensibility** — Feature folders and changes to shared route/navigation/schema/seed indexes must remain additive and small because every later FRD depends on this foundation. Status: Mandated.
- **Deployment safety** — Migrations run separately before the new API starts; promotion uses the same image tag. Rollback must consider that data/schema rollback may not be safe after a migration. Status: Mandated for forward migration and promotion; Open – Non-blocking for detailed rollback/runbook design, owner: Architect + DevOps, target: release planning.

## Technology Constraints, Preferences and Open Selections

| Area | Item | Tech Status | Driver / Rationale | Decision Owner |
| --- | --- | --- | --- | --- |
| Frontend | TypeScript strict, React 19, Vite 6, React Router, TanStack Query, CSS Modules/design tokens | Mandated | TDD-01 §1 | Architect / Development |
| Backend | Node.js 22 LTS, Fastify 5, Zod shared validation | Mandated | TDD-01 §1 | Architect / Development |
| Data stores | PostgreSQL 16, Drizzle ORM/drizzle-kit, SQL migrations | Mandated | TDD-01 §1, §3.2 | Architect / Data |
| Integration | Google OIDC, Google Sheets export, Anthropic SDK | Mandated | TDD-01 §1; PO clarification confirms known integration set | Architect / Development |
| Infrastructure | Docker/Compose and GitLab CI | Mandated | TDD-01 §1, §7–8 | DevOps |
| Containers | SIT/UAT container host | Open for architecture decision | Shared Linux VM fallback is specified until host selection; selection is TDD-OI-01. | Product Owner / DevOps |

## Environment and Infrastructure Requirements

- **DEV** — Developer machine and CI, seed/test data, stub OIDC allowed, fake AI gateway by default; local startup uses Docker Compose. Status: Mandated.
- **SIT** — System integration environment after each FRD with seed/test data; stub or Google OIDC allowed and real AI only for tagged later tests. Status: Mandated.
- **UAT** — Product Owner acceptance environment with demo journals, real Google sign-in, and real AI; this increment need not deploy UAT. Status: Mandated.
- **Parity and configuration** — Same Docker images run in each environment; configuration comes from environment variables. Status: Mandated.
- **SIT host** — Until a container host is selected, SIT uses a Docker Compose stack on a shared Linux VM with separate port/database. Status: Mandated (TDD fallback). Container-host selection remains open for future real-traffic testing. Status: Open – Non-blocking; owner: Product Owner / DevOps; target: before first real-traffic SIT deployment.

## Engineering and Quality Requirements

- **Repository practices** — pnpm workspace root commands, strict TypeScript, linting and formatting follow TDD-01. Status: Mandated.
- **Quality gates** — CI requires zero lint/type errors; ≥80% line coverage in shared/API modules; migration checks against empty and preceding schemas; E2E, accessibility, dependency, SBOM, and endpoint load gates as applicable. Status: Mandated.
- **Testing isolation** — Tests use real PostgreSQL, unique temporary databases/free ports, and do not depend on execution order. Status: Mandated.
- **Dependency discipline** — Do not add a second framework for capabilities already covered; new runtime dependencies require feature ADR justification. Status: Mandated.
- **Documentation** — Feature ADRs and feature TDD are repository deliverables under the project-level TDD rules. Status: Mandated.

## Testing and Acceptance Strategy

- **Acceptance authority** — Product Owner holds UAT/go-live acceptance and business-dispute authority. Status: Confirmed (Product Owner clarification, 2026-11-21).
- **Functional coverage** — Execute tests mapped to AC-01-01 through AC-01-13, with acceptance criterion IDs in test names. Status: Mandated.
- **NFR coverage** — Execute API, Playwright/axe, Lighthouse, CI security, migration, log, and appropriate k6 checks identified in the NFR table. The FRD permits the initial load stage to exercise `/health` only. Status: Mandated.
- **Pre-UAT browser coverage** — Chromium for FRD CI; Chromium, Firefox, and WebKit before UAT. Status: Mandated.
- **Release evidence** — Retain test results, SBOM, vulnerability scan, deployment record, and SIT smoke-check evidence for Product Owner acceptance. Status: Recommended; owner: QA + DevOps; target: release handoff.

## Delivery, Release and Deployment Requirements

- **Pipeline** — On integration-branch commits, build once, pass all gates, produce CycloneDX SBOM, and promote the same image DEV → SIT. Status: Mandated.
- **Deployment scope** — Deploy this foundation to DEV and SIT; UAT comes later in the ladder. Status: Confirmed.
- **Migration ordering** — Apply database migrations before starting the new API version. Status: Mandated.
- **Strategy and approvals** — No rolling/blue-green/canary strategy, maintenance window, or release approval policy beyond Product Owner UAT/go-live authority is supplied. Status: Open – Non-blocking; owner: DevOps + Product Owner; target: before production release.
- **Rollback** — Detailed rollback and data rollback limitations are not specified; migrations can make data rollback infeasible. Status: Open – Non-blocking; owner: Architect + DevOps; target: before first production release.

## Migration and Rollout Requirements

- **Application migration** — No legacy application or user data exists to migrate because this is the greenfield foundation. Status: Not Applicable.
- **Initial database migration** — Create `users`, including `is_demo` with default false, from an empty database. Status: Mandated.
- **Demo data/user migration** — Not Applicable in FRD-01: no demo journal data is seeded or used; later demo behavior creates temporary rows/copies. Status: Confirmed.

## Operations and Support Requirements

- **Operational signals** — `/health`, `/ready`, and pino JSON logs with request IDs are required. Status: Mandated.
- **Log privacy** — Future logs must exclude journal content, photos, notes, AI prompts, and answers; IDs may be logged. Status: Mandated.
- **Operational owner/support hours/SLO** — Not specified. Status: Open – Non-blocking; owner: Product Owner + Operations; target: before production release.
- **Runbooks, alerting, backup/restore, DR** — Not specified for this foundation. Status: Open – Non-blocking; owner: Operations + DevOps; target: before production release.

## Traceability Matrix

| Requirement ID | Source | Stakeholder / Owner | Acceptance Criterion | Validation Method | Status |
| --- | --- | --- | --- | --- |
| FR-001 | FRD-01 FR-01-01–02; TDD-01 §1–2 | Development | AC-01-01 | Root commands and CI | Mandated |
| FR-002 | FRD-01 FR-01-03 | Development/DevOps | AC-01-02 | Docker Compose smoke | Confirmed |
| FR-003 | FRD-01 FR-01-04–05 | Operations | AC-01-03–05 | API tests | Mandated |
| FR-004 | FRD-01 FR-01-06–07; SRS NFR-SEC | Security | NAC-01-01–04 | API/CI tests | Mandated |
| FR-005 | FRD-01 FR-01-08 §6; PO clarification | Data | AC-01-06 | Empty-DB migration test | Mandated |
| FR-006 | FRD-01 FR-01-09–10; SRS NAV | UX/Development | AC-01-07–10 | Playwright | Mandated |
| FR-007 | FRD-01 FR-01-11 | Product/UX | AC-01-11 | Playwright/visual review | Confirmed |
| FR-008 | FRD-01 FR-01-12 | UX/QA | AC-01-12 | Playwright keyboard test | Mandated |
| FR-009 | FRD-01 FR-01-13; TDD-01 §8 | DevOps | AC-01-13 | CI/deployment evidence | Mandated |
| FR-010 | FRD-01 FR-01-14 | UX/QA | AC-01-10 | Playwright | Confirmed |

## Decision Register

| ID | Decision Required | Context and Constraints | Options | Recommendation | Owner | Decision Deadline | Status | Downstream Impact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEC-001 | Select SIT/UAT container host | TDD-01 specifies shared-VM fallback until a host is selected. | Retain VM fallback; choose managed/container host later. | Retain documented fallback for FRD-01; assess host before real-traffic SIT. | Product Owner / DevOps | Before first real-traffic SIT deployment | Open – Non-blocking | Infrastructure/deployment |
| DEC-002 | Define production release strategy and rollback policy | Same-image promotion and migration ordering are mandated; production policy absent. | Rolling, blue-green, canary, or approved manual process. | Architect/DevOps to propose against availability/risk constraints. | Architect / DevOps / PO | Before first production release | Open – Non-blocking | Release/Operations |
| DEC-003 | Define retention, backup, restore, RPO/RTO | Product data-control requirements exist but operational targets do not. | Set targets appropriate to service risk. | Product Owner and Operations to define measurable targets. | Product Owner / Operations | Before first production release | Open – Non-blocking | Data/Operations |

## Assumption Register

| ID | Assumption | Reason | Validation Owner | Validation Deadline | Impact if Incorrect |
| --- | --- | --- | --- | --- | --- |
| ASM-001 | The shared Linux VM fallback can host isolated SIT Docker Compose stack for FRD-01. | TDD-01 §7 explicitly defines it pending host selection. | DevOps | Before SIT deployment | SIT deployment cannot proceed on fallback. |
| ASM-002 | No external integration must be invoked in FRD-01. | FRD scope excludes sign-in/AI and PO named only future integrations. | Architect / Development | Architecture review | Scope or configuration changes may be needed. |

## Dependency Register

| ID | Dependency | Type | Owner | Needed By | Status | Impact if Unavailable |
| --- | --- | --- | --- | --- | --- |
| DEP-001 | Docker runtime and local/CI PostgreSQL support | Platform | Development / DevOps | Local and CI build | Confirmed | Docker/real-PostgreSQL gates fail. |
| DEP-002 | GitLab CI runner and artifact storage | Delivery platform | DevOps | CI pipeline | Confirmed | Cannot execute mandated pipeline/evidence. |
| DEP-003 | Shared Linux VM fallback and credentials | Infrastructure | DevOps | SIT deployment | Assumed | SIT deployment is blocked until fallback/host is available. |
| DEP-004 | Google OAuth registrations | External integration | Product Owner | FRD-02 SIT | Deferred | Does not affect FRD-01, blocks later sign-in. |
| DEP-005 | Anthropic SIT/UAT key with spend limit | External integration | Product Owner | FRD-09 SIT | Deferred | Does not affect FRD-01, blocks later AI delivery. |

## Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RSK-001 | Foundation shared files become hard to extend across later FRDs. | Medium | High | Enforce feature-folder boundaries and small additive shared-index changes. | Architect / Development | Mitigated by mandated constraints |
| RSK-002 | Prototype defects are copied as behavior. | Medium | Medium | Treat prototype as visual only; use BRD/SRS rules and tests as authority. | Product / QA | Mitigated |
| RSK-003 | SIT host selection is delayed. | Medium | Medium | Use documented shared-VM fallback; track DEC-001. | DevOps / PO | Open – Non-blocking |
| RSK-004 | Security baseline is weakened because future authentication is out of scope. | Medium | High | Implement input validation, headers, secrets discipline, IP rate limit, scans, and request IDs now. | Development / Security | Mitigated by FRD scope |

## Open Questions

### Blocking

None. The Product Owner answered all mandatory elicitation topics applicable to this run: known integration set, additional regulatory/privacy/residency constraints, schedule/budget constraints, acceptance authority, and initial `is_demo` migration inclusion. The technical stack is mandated by TDD-01. Greenfield scope means no existing behavior requires preservation.

### Non-blocking

- **Container host selection (DEC-001/TDD-OI-01)** — Product Owner / DevOps; resolve before first real-traffic SIT deployment. The VM fallback permits FRD-01 SIT deployment.
- **Production release/rollback policy (DEC-002)** — Architect / DevOps / Product Owner; resolve before first production release.
- **Retention, backup, restore, RPO/RTO and operational support model (DEC-003)** — Product Owner / Operations; resolve before first production release.

## Readiness Assessment

**Overall rating: Ready for Architecture.** FRD-01 scope, mandated technology constraints, data foundation, integrations, acceptance authority, measurable quality criteria, and delivery path are clear. The remaining decisions are explicitly owned and affect later production planning rather than safe architecture of the foundation.

| Workstream | Ready / Conditional / Blocked | Evidence | Remaining gap | Owner |
| --- | --- | --- | --- | --- |
| Product and business | Ready | FRD/BRD scope, PO acceptance authority, no schedule/budget constraint | None material to FRD-01 | Product Owner |
| UX | Ready | Responsive shell, visual reference, copy, accessibility requirements | Detailed feature design belongs to later FRDs | UX |
| Architecture | Ready | TDD-mandated stack/boundaries/API/data rules | Feature ADR implementation choices | Architect |
| Data | Ready | Initial users schema and migration rules, `is_demo` confirmed | Long-term retention/RPO targets | Data / PO |
| Security | Ready | Headers, validation, secret scanning, rate limit, dependency scanning | Future auth/AI controls are later-scope | Security |
| Development | Ready | Concrete FRs, routes, commands, components, acceptance tests | None material | Development |
| QA | Ready | AC/NAC mappings and test tooling rules | Test evidence execution follows build | QA |
| Infrastructure and DevOps | Conditional | Docker/CI/promotion and VM fallback are specified | Confirm VM access; select future host | DevOps / PO |
| Migration | Ready | Greenfield with initial migration and no legacy data | None | Data / Development |
| Operations | Conditional | Health/readiness/logging requirements | SLO/support/runbook/DR targets before production | Operations / PO |

## Delivery Workstreams and Todo List

- **Business analysis** — Maintain FRD boundaries and Product Owner acceptance evidence; carry later product scope into subsequent FRDs.
- **UX** — Translate visual constraints into a foundation UI contract; verify responsive, keyboard, focus, and empty/error states.
- **Architecture** — Produce feature ADR/TDD within TDD-01, resolving implementation details without changing mandated stack rules.
- **Security** — Verify validation, header, secrets, rate-limit, and dependency-control evidence.
- **Data** — Review initial migration, uniqueness/defaults, and migration execution from empty database.
- **Development** — Implement traceable FRs/RS scenarios and root commands.
- **Testing** — Map and execute all AC/NAC tests and retain evidence.
- **DevOps** — Establish CI, image promotion, DEV/SIT configuration, VM fallback deployment, smoke checks.
- **Migration** — Validate empty-DB migration; no legacy migration work applies.
- **Operations** — Define production operational model before production scope begins.

## Handoff Contract

- **Product / BA** — Receives scope, journeys, functional baseline, business rules, acceptance authority, and explicit exclusions.
- **UX** — Receives personas, responsive channels, welcome/placeholder requirements, accessibility targets, and prototype limitations.
- **Architect** — Receives mandated stack/boundaries, architecture drivers, initial data/integration needs, and owned downstream decisions.
- **Security** — Receives security/privacy baseline, evidence requirements, and future AI/auth threat areas.
- **Developer** — Receives FR-001–FR-010, RS-001–RS-009, component/routes/API/migration expectations, and Definition-of-Done constraints.
- **QA** — Receives AC/NAC-derived validation, reference scenarios, test tool/environment rules, and measurable NFRs.
- **DevOps** — Receives environment ladder, CI/promotion/migration constraints, SIT fallback, health checks, and unresolved host/release decisions.
- **Operations** — Receives health/readiness/logging requirements and explicit production-readiness gaps to close before production.
