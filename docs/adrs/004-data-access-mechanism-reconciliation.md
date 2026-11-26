# 004. Data-Access Mechanism Reconciliation

## Status

Proposed

## Context

`docs/source/TDD-01.md` §1 mandates "Drizzle ORM + drizzle-kit" (`:26`) and §3.2 says drizzle-kit generates timestamp-prefixed SQL migrations (`:104`); it forbids a second ORM (`:38`) and states that a feature decision needing a TDD-01 rule change requires TDD-02 (`:10`). The deployed FRD-01 implementation instead uses raw SQL over `pg`: no Drizzle dependency in `apps/api/package.json:14-22`, a `pg.Pool` in `apps/api/src/plugins/database.ts:2,10-26`, and a hand-written migration runner in `apps/api/src/db/migrate.ts:21-68`. Only one migration exists, `20261121000000_create_users.sql`.

FRD-02 adds three tables (`user_identities`, `sessions`, `profiles`), a schema index, and repository functions. The approved baseline records this divergence as DEC-004 (`:345`) and risk RSK-008 (`:384`), and explicitly requires reconciliation without silently changing the stack or changing a TDD-01 rule (`:84, :241-242`). `baseline-policy.json` → `architecture.nonOverridable.boundary-decision-requires-adr` makes a persistence choice ADR-mandatory, and `security.nonOverridable.parameterized-queries-only` constrains how queries are written. The human confirmed option (a) at the Design stage: extend the shipped raw-SQL mechanism.

## Decision

Extend the deployed mechanism additively: three versioned SQL files with `YYYYMMDDHHMMSS_` prefixes applied in filename order (`user_identities`, then `sessions`, then `profiles`), and parameterized repository functions over the existing `pg.Pool`. Reuse the `uuidv7()` function from the shipped migration; do not edit `20261121000000_create_users.sql`. Repository functions take `userId` as their first parameter and apply the owner-scope predicate (ADR-005).

No Drizzle dependency, no drizzle-kit, no second ORM, no schema push, and no rewrite of the deployed `users` path in FRD-02. The deviation from TDD-01 §1/§3.2 is recorded here deliberately, not hidden: the TDD-01 rule stays in force and its reconciliation belongs to a separately approved TDD-02, not to a local exception in this feature. Migrations continue to run as a distinct step before the new API version, executed by the deployer's environment-owned command (`scripts/ci/promote-release.mjs:32,42`); the API process does not self-migrate. Recovery after a successful migration is forward-only.

## Alternatives Considered

| Option | Why not chosen |
| --- | --- |
| Add Drizzle for the new tables only | Two data-access mechanisms against one database; TDD-01 `:38` forbids a second ORM without justification, and the first-sign-in transaction (ADR-003) would span two mechanisms. |
| Migrate the whole foundation to Drizzle now | Rewrites deployed DEV/SIT behavior outside FRD-02 scope, breaks the additive-only rule, and adds migration/rollback risk. |
| Non-versioned schema push or ad hoc SQL outside migrations | Violates TDD-01 §3.2, NFR-OPS-003, and the migration CI gate; removes reviewability and ordering. |
| Parameter concatenation for dynamic filters | Violates `baseline-policy.json` `parameterized-queries-only`; dynamic identifiers would need allowlisting. |

## Consequences

- One consistent mechanism matches the deployed code; the new tables and their transaction are reviewable as plain SQL plus typed repository wrappers.
- The textual Drizzle mandate remains in TDD-01 and is now a documented, owned drift item. A later TDD-02 must either adopt Drizzle everywhere or amend the rule; FRD-02 does not decide that.
- Migrations are non-transactional in the shipped runner (`migrate.ts:56-59`); FRD-02 migrations must therefore be individually idempotent-safe (`IF NOT EXISTS` where possible) and verified before the API starts.
- Every new query must be parameterized and owner-scoped; the owner-scope unit test and migration CI gate are release evidence.
- Same-image/tag DEV → SIT promotion is unchanged; the deployer adds the migration step, not a new deployment topology.

## Related

- Requirement(s): FR-02-03, FR-02-12; NFR-OPS-003, NFR-SEC-01; DEC-004; RSK-008.
- Supersedes / Superseded by: None. Depends on ADR-001 and `docs/source/TDD-01.md` §§1, 3.2, 7, 10.
