# DEV-to-SIT Promotion Evidence

## Preconditions

Run the successful default-branch pipeline. Its quality jobs retain test, migration, dependency-scan, SBOM, browser/accessibility, Lighthouse, and k6 evidence for 30 days. `LIGHTHOUSE_URL` and `K6_BASE_URL` are protected CI variables pointing to the disposable verification target; no credential values are stored in this repository.

The `release-pair` job creates `artifacts/release/release-manifest.json`. Inspect it before promotion: its `web` and `api` image references must both end with the identical integration commit SHA. Do not rebuild or retag either image.

## Manual DEV promotion

Trigger `promote-dev` from the release pipeline and supply only protected variables:

- `TARGET_ENV`: set by the `promote-dev` job to `dev`.
- `RELEASE_MANIFEST`: path to the retained manifest artifact.
- `MIGRATE_COMMAND`: environment-owned command that applies migrations before starting the new API.
- `SMOKE_COMMAND`: environment-owned same-origin health smoke command.

The promotion script obtains `RELEASE_WEB_IMAGE` and `RELEASE_API_IMAGE` only from the validated manifest, then runs the repository-owned `docker-compose.release.yml` with `--no-build`. That Compose definition accepts no alternate image source. The job rejects missing input or invalid/mismatched tags, runs migration before deployment, and writes `artifacts/promotion/dev.jsonl` after a successful smoke check.

## Manual SIT promotion

After the DEV job succeeds, trigger `promote-sit` using the same manifest and image references. The job receives the DEV artifact path `DEV_PROMOTION_EVIDENCE=artifacts/promotion/dev.jsonl` and verifies its tag and both image references match the supplied release manifest. Use the documented Compose-on-shared-VM fallback until a container host is selected. The job repeats the migration-first deployment and writes `artifacts/promotion/sit.jsonl`.

`promote-sit` sets `TARGET_ENV=sit`; do not override it. Both jobs reject any other environment value.

If a migration or smoke check fails, stop promotion. Do not rebuild the pair or attempt an unsafe schema rollback; create and validate a forward corrective migration before a new release pipeline.
