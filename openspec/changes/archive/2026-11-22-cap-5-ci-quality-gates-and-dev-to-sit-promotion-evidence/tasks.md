# Tasks

## 1. CI quality evidence

- [x] 1.1 Add GitLab CI stages and jobs for lint, typecheck, tests with coverage, migration checks, Playwright/axe, dependency scanning, CycloneDX SBOM, Lighthouse, and health-endpoint k6 checks; verify required jobs publish retained artifacts and fail on gate failure
- [x] 1.2 Add repository-owned scripts and fixture-safe checks used by CI quality jobs; verify their documented commands exit successfully against the foundation

## 2. Immutable release and promotion evidence

- [x] 2.1 Add a release-build job that builds the web/API pair once per integration commit with the same immutable commit tag and emits a verified release manifest; verify the manifest rejects mismatched tags
- [x] 2.2 Add manual DEV and SIT promotion jobs/scripts that consume the successful manifest, apply migrations before API startup, enforce DEV-before-SIT ordering, and retain smoke evidence; verify invalid or mismatched promotion input fails safely
- [x] 2.3 Document the manual DEV-to-SIT promotion procedure, runner/environment prerequisites, evidence locations, and forward-recovery limitation; verify the documented commands and environment-variable requirements match the scripts
