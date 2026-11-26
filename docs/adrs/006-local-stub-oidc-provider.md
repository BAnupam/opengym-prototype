# 006. Local Stub OpenID Provider for DEV and SIT

## Status

Proposed

## Context

TDD-01 §4 requires "a local stub OpenID provider (a container in `docker-compose.yml`)" for automated tests in DEV and SIT, enabled by `AUTH_TEST_PROVIDER=true`, with the API refusing to start when that setting is combined with `APP_ENV` `uat` or `prod` (`:121`). FRD-02 repeats this as FR-02-11, BR-02-07, AC-02-13 and RSK-005. There is no stub container today: `docker-compose.yml` defines only `db`, `api`, and `web`, and `AUTH_TEST_PROVIDER` appears only in documentation.

DEC-003 asked for a library and stub-provider choice; the human selected a small purpose-built stub container. `baseline-policy.json` → `architecture.nonOverridable.boundary-decision-requires-adr` applies: adding a Compose service to the DEV/SIT stack changes that stack's topology even though the manual deployment mode means IRIS makes no ladder/target/strategy decision. Deployment mode is `manual`, so this ADR covers only the test-stack addition, not a production topology.

## Decision

Add a small purpose-built stub OpenID provider service to the DEV and SIT Compose stacks. It exposes an authorize endpoint with a sign-in form, a token endpoint, and a JWKS endpoint, and issues real signed ID tokens with the configured issuer, audience, `sub`, `email`, and `name` claims so the production validation path in ADR-002 runs unchanged. Test signing keys are generated inside the container and never committed. The stub receives no `DATABASE_URL`, Google client credentials, or `SESSION_SECRET`.

The stub is used only when `AUTH_TEST_PROVIDER=true`. The API validates configuration at startup and refuses to start when the flag is true and `APP_ENV` is `uat` or `prod`, with an error naming `AUTH_TEST_PROVIDER` (AC-02-13). Automated tests, including Playwright E2E, drive the stub; the single real-Google SIT check remains a manual, PO-registration-dependent verification (DEP-002). The stub image is pinned or promoted with the same release tag and is never added to a UAT/production stack.

## Alternatives Considered

| Option | Why not chosen |
| --- | --- |
| Off-the-shelf generic mock IdP image | Larger third-party surface to pin and operate; its claim/negative-case knobs may not map cleanly onto the callback negative tests required by AC-02-04. |
| In-process fake plugin inside the API | Bypasses the real HTTP redirect, token exchange, and discovery path, so it cannot prove the same-origin end-to-end flow; also couples test tooling to production code. |
| Use real Google for all automated tests | Requires credentials in CI, external availability, and PO registration; contradicts TDD-01 §4 and blocks offline/concurrent test runs. |
| No stub; manually seed sessions | Would bypass the code under test and leave AC-02-01/04 unverified. |

## Consequences

- The full authorization-code flow, including callback validation, is exercised in automated tests with controllable negative cases and no external dependency.
- One extra Compose service must be maintained and included by whoever deploys DEV/SIT; the manual deploy checklist in the TDD names it explicitly.
- The fail-closed startup guard is release-critical evidence (AC-02-13); config review and CI tests must prove the stub cannot be enabled in `uat` or `prod`.
- The DEV/SIT Compose topology gains a service, but the web/API image pair, same-tag promotion, and API-only database boundary are unchanged (ADR-001).
- Test isolation rules still apply: E2E and API runs use their own databases, free ports, and self-cleaned tagged data.

## Related

- Requirement(s): FR-02-11; AC-02-13; BR-02-07; RSK-005; DEC-003; ASM-004; DEP-003; NFR-SEC-06 guard.
- Supersedes / Superseded by: None. Depends on ADR-001 (boundary), ADR-002 (validation path), and `docs/source/TDD-01.md` §§4, 7, 9.
