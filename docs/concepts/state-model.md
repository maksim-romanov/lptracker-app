# State model

One table for every lifecycle and availability status ([ADR 0017](../decisions/0017-state-model.md)). Lifecycle belongs to a family, status to a chain or deployment, scope status to one deployment in one response. Ids are never deleted.

## Effective availability

A deployment is read only when all four inputs allow it:

```
available(deployment) =
  lifecycle(family) ∈ visible set for this instance
  ∧ deployment.status ≠ sunset
  ∧ instance.config enables the deployment
  ∧ no kill flag covers it (kill.integration.<family>, kill.deployment.<id>, kill.sync.<chain>)
```

The first input that fails decides the scope status: sunset → `retired`, not enabled or missing dependency → `not_configured`, kill flag → `failed` with code `KILLED`.

## States

| Field · value | Meaning | Clients | Worker |
|---|---|---|---|
| lifecycle · `development` | Merged, not ready | Hidden | Ignores |
| lifecycle · `alpha` | Works, may be wrong | Only when the instance enables alpha; badge "alpha" | Refreshes, no alerts |
| lifecycle · `beta` | Silver tier or higher | Shown | Refreshes and alerts |
| lifecycle · `stable` | Gold tier or higher | Shown | Refreshes and alerts |
| lifecycle · `unmaintained` | No owner reply for 6 weeks | Shown with a warning | Refreshes, no alerts |
| lifecycle · `deprecated` | Scheduled for removal, 90 days' notice | As its deployments say | As its deployments say |
| deployment · `active` | Normal | Shown | Refreshes |
| deployment · `read-only` | Protocol stopped new positions here | Existing positions shown | Refreshes; no new watch targets |
| deployment · `sunset` | No longer read | Scope `retired` | Drops its watch targets and alert rules; tells subscribers once |
| chain · `deprecated` | Chain winding down | Its deployments must be `read-only` or `sunset` (validated) | Follows the deployments |
| scope · `ok` | Deployment answered | Shows positions; `truncated` if capped | Diffs it |
| scope · `pending` | Still loading (web lazy frame) | Skeleton | — |
| scope · `failed` | Error, deadline or kill; `code` says why | Shows what answered, names what did not | Carries earlier state forward |
| scope · `retired` | Deployment is sunset | Explains once, no retry | Skips |
| scope · `not_configured` | Instance lacks a declared dependency or disabled it | Explains once, no retry | Skips |

Scope codes are open uppercase strings: `INDEX_STALE`, `INDEX_TRUNCATED` (only with status `ok` and `truncated: true`), `RPC_ERROR`, `TIMEOUT`, `NOT_CONFIGURED`, `KILLED`, `BUDGET_EXHAUSTED`.

Position `status` and range `status` are values, not availability; they live in [position-model.md](position-model.md). A deployment may name `supersededBy`; clients point people to the protocol's new contracts.

## Merge, promotion, maintenance

- `bun run new:protocol` creates a family at `development`.
- A PR merges at `alpha` and needs bronze tier.
- `alpha` → `beta` happens automatically when silver-tier checks pass and the family has spent 30 days at `alpha` with no open correctness bug.
- `beta` → `stable` needs gold tier and a maintainer's approval.
- A bot pings a family's owners on every correctness issue; 6 weeks without a reply from any owner marks the family `unmaintained`.
- An adoption PR that names a new owner and passes silver moves an `unmaintained` family back to `beta`.
- `deprecated` is announced 90 days before its deployments turn `sunset`.

## Quality tiers

Each rule in `quality.yaml` has a machine id and is `done`, `todo` or `exempt` with a reason.

| Tier | Adds |
|---|---|
| Bronze | Schema-valid manifest, conformance passes on cassettes, cassettes per deployment, source URL on every address, an owner |
| Silver | Cassettes for closed, empty, out-of-range and staked positions; typed errors; fees and rewards separated |
| Gold | Values checked against the protocol's own UI or API at pinned blocks |
| Platinum | Scheduled live smoke test; at least two owners |
