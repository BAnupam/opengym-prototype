# Proposal

## Why

FR-009 requires every integration-branch commit to have reproducible quality evidence and a release pair that can be promoted without rebuilding. The foundation needs a GitLab delivery contract before it can be safely advanced from DEV to SIT.

## What Changes

- Add GitLab CI quality gates for linting, type checking, tests and coverage, migration verification, browser/accessibility checks, dependency scanning, SBOM generation, Lighthouse, and health-endpoint load testing.
- Build the web and API images once per integration commit with one immutable commit tag, retaining quality and release evidence.
- Define manual DEV then SIT promotion evidence that applies migrations before the API and reuses the same tagged image pair.

## Capabilities

### New Capabilities
- `delivery-pipeline`: GitLab quality evidence, immutable matched image builds, and manual same-tag DEV-to-SIT promotion records.

### Modified Capabilities
- None.

## Impact

Adds `.gitlab-ci.yml`, delivery scripts and evidence/runbook documentation, and CI-oriented validation assets. The workflow preserves the same-origin web/API boundary, keeps secrets environment-only, and does not automate UAT or production deployment.
