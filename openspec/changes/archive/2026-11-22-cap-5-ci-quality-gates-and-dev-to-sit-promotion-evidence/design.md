# Design

## Context

See `proposal.md` for motivation and `specs/delivery-pipeline/spec.md` for the delivery behavior. The foundation already provides workspace commands, a same-origin Compose runtime, API health endpoints, migrations, and browser tests. TDD-01 §8 mandates the CI gates; ADR-001 requires web and API releases to retain the same commit tag and migrations to run before the new API.

## Goals / Non-Goals

**Goals:**
- Express the mandated checks as ordered GitLab jobs with retained evidence.
- Produce both container images only after quality gates pass, using the integration commit SHA as their shared immutable tag.
- Make DEV and SIT promotions manual, tag-verified, migration-first operations with smoke evidence.

**Non-Goals:**
- Selecting a container host, automating UAT or production rollout, and defining a production rollback policy.
- Adding runtime credentials, rebuilding images at promotion time, or changing application behavior.

## Decisions

### Pipeline stages enforce a release evidence chain
Quality jobs run before the image build, publish their native reports as artifacts, and block later stages on failure. The release build publishes a small manifest that binds both images to the commit tag and the quality evidence. This makes the promotion input explicit rather than relying on mutable image labels.

Alternative considered: build images in every deployment job. Rejected because it can produce different artifacts for DEV and SIT.

### Promotion jobs consume a verified manifest and are manual
DEV and SIT jobs accept only a manifest from the successful integration pipeline. They verify that both image references use the same commit tag, apply migrations as a separate pre-start step, deploy the pair, then retain a health smoke record. SIT depends on a successful DEV promotion.

Alternative considered: automatic environment deployment. Rejected because the capability requires manual promotion and the deployment host remains a documented fallback/open operational concern.

### CI secrets stay external
Registry and environment connection values are referenced as masked GitLab CI variables; no secret value is placed in tracked files or evidence. Deployment scripts reject absent required variables.

Alternative considered: sample credentials in CI configuration. Rejected by the repository security baseline and ADR-001.

## Risks / Trade-offs

- [CI runners may not have browser, Docker, or k6 support] → Use tagged jobs and document the runner capabilities required by each stage.
- [The SIT host has not been selected] → Retain the documented Compose-on-shared-VM fallback and make the deployment command environment-configured.
- [A forward migration cannot safely roll back] → Stop deployment on migration failure and require a forward corrective migration rather than automatic schema rollback.

## Migration Plan

1. Add CI configuration, verification scripts, and a promotion-evidence runbook.
2. On an integration commit, run quality gates and build the matched tagged pair once.
3. Manually invoke DEV promotion from its evidence manifest; run migrations before starting the new API and record a smoke result.
4. Manually invoke SIT only from the successful DEV manifest, with the same migration-first and smoke-evidence process.
5. If deployment fails after migration, halt promotion and use a forward corrective migration; do not rebuild the pair or perform an unsafe schema rollback.
