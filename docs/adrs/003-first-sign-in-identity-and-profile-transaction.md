# 003. First-Sign-In Identity Reconciliation and Profile Transaction

## Status

Proposed

## Context

FRD-01 shipped `users` with `email TEXT NOT NULL UNIQUE` (case-sensitive, no lowercased index) in `apps/api/src/db/migrations/20261121000000_create_users.sql:18-25`; there are no real seeded users today. FRD-02 must create a user, an identity row, and a profile on first Google sign-in, and must reuse the same user on later sign-ins. Business rule BR-02-01 makes the Google subject ID — not email or display name — the identity key, and FR-02-04/AC-02-03 forbid overwriting an OpenGym display name from Google.

The approved baseline leaves two decisions to the feature design: DEC-001 (how a Google email interacts with the unique `users.email` column, including collision and email change) and DEC-002 (whether the three inserts are atomic). Its recommendations are to keep the first-sign-in email immutable and match solely by subject, and to create user, identity, and profile in one transaction keyed by subject. No TDD-01 rule may be changed (TDD-01 `:10`; baseline `:68, :242`), so the unique constraint is not relaxed in this increment.

## Decision

Resolve identity solely by `(provider = 'google', subject)` via `user_identities`. On first sign-in, insert the `users` row (Google display name, Google-supplied email, browser IANA time zone into both `users.time_zone` and `profiles.time_zone`), the `user_identities` row, and the `profiles` row with the fixed BR-02-03 defaults in **one database transaction**; no session exists until that transaction commits. On later sign-ins, reuse the existing user and profile: never overwrite `users.display_name`, `users.email`, or the stored profile defaults from Google. Store any changed Google email only in `user_identities.email` as current identity metadata.

`users.email` remains unique and immutable after first sign-in. If a first sign-in would insert a Google email that already exists in `users` under a different subject, fail that sign-in closed: no session, no partial rows, generic sign-in error message, and no email value in logs. Do not relax or drop the constraint, and do not merge on email — either would break identity-by-subject and could join two different people's accounts. A future rule or data-change decision to handle collisions differently requires TDD-02 or a human-approved design change, not a local exception.

## Alternatives Considered

| Option | Why not chosen |
| --- | --- |
| Update `users.email` from Google on every sign-in | Email is not the identity key (BR-02-01); a change could collide with another user's immutable email and would contradict the display-name immutability rule. |
| Drop or relax the unique constraint on `users.email` | Silently changes the deployed FRD-01 schema and may permit duplicate principals; outside FRD-02 authority without a TDD-02. |
| Separate inserts with later reconciliation | Violates AC-02-01 atomicity: a failure between inserts would leave a user with no profile or identity, and concurrent first sign-ins could create two users (AC-02-02). |
| Identify the user by email and treat subject as metadata | Directly contradicts BR-02-01 and risks account takeover when an email is reassigned by the IdP. |

## Consequences

- First sign-in is atomic across three tables; a failed callback leaves no user, identity, profile, or session behind.
- Returning sign-ins are idempotent by subject; a changed Google display name or email cannot alter OpenGym-owned values.
- An email collision blocks first sign-in with a generic error (risk RSK-004). The `users` table has no real accounts in FRD-02, so this is a forward-looking rule; Operations/PO may revisit it with data authority before production.
- `user_identities.email` may diverge from `users.email` by design; consumers must use `users.email` for the `/me` response and treat the identity email as IdP metadata only.
- Tests must cover first sign-in, returning sign-in, changed Google display name, changed Google email, and an email-collision case with no partial rows.

## Related

- Requirement(s): FR-02-03, FR-02-04, FR-02-12; AC-02-01, AC-02-02, AC-02-03; BR-02-01, BR-02-02, BR-02-03; RS-001, RS-002, RS-003; DEC-001, DEC-002.
- Supersedes / Superseded by: None. Depends on ADR-001 (API-only database access) and `docs/source/TDD-01.md` §3.2 (UUID v7 keys, ownership, migrations).
