# Spec Delta

## Purpose

Provides verifiable foundation delivery gates and immutable release evidence for promoting the matched OpenGym web and API pair from DEV to SIT.

## ADDED Requirements

### Requirement: Foundation quality evidence
GitLab CI SHALL run lint, typecheck, tests and coverage, migration checks, Playwright and axe checks, dependency scanning, CycloneDX SBOM generation, Lighthouse, and applicable health-endpoint k6 checks for integration-branch commits. It SHALL retain test, migration, vulnerability, SBOM, Lighthouse, and load-test evidence and fail when a mandated gate fails.

#### Scenario: Integration quality gate
- **WHEN** an integration-branch commit enters the pipeline
- **THEN** CI retains the required quality evidence and fails on a mandated gate failure

### Requirement: Immutable promotion pair
CI SHALL build the web and API release pair once per integration commit with the same immutable integration-commit tag. The manual release procedure SHALL deploy that exact pair to DEV before SIT after migrations run separately, and SHALL not rebuild either artifact between environments.

#### Scenario: Same-image promotion
- **WHEN** a successful release is promoted from DEV to SIT
- **THEN** the web and API artifacts retain the integration commit tag and are not rebuilt between environments
