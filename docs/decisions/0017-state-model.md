# 0017 · One state model for lifecycle, chain, deployment and scope

- Status: proposed
- Deciders: Maksim Romanov

## Context

Chains, deployments and families each need a way to be introduced, retired and marked unhealthy. Separate, unrelated status sets leave clients and the worker guessing what to do with existing positions and alerts.

## Options

- **Independent status fields per entity**, defined where they are used.
- **One state model** with defined client and worker behaviour per state.

## Decision

Chosen **one state model**, specified in [state model](../concepts/state-model.md):

- **Lifecycle** of a family: `development` (hidden), `alpha` (only when the instance enables it, no alerts), `beta` (silver tier) and `stable` (gold tier), both shown with alerts, `unmaintained` (no owner reply for 6 weeks: shown with a warning, no alerts), `deprecated`.
- **Deployment status**: `active`, `read-only` (existing positions shown, no new watch targets), `sunset` (scope `retired`; the worker drops its watch targets and alert rules and tells subscribers once). Optional `supersededBy` points to the replacement.
- **Chain status**: `active`, `deprecated`. Deployments on a deprecated chain must be `read-only` or `sunset`; `bun run voidx validate` enforces it.
- **Scope status**: `ok`, `pending`, `failed`, `retired`, `not_configured`, lowercase; `code` is an open uppercase string (`INDEX_STALE`, `INDEX_TRUNCATED`, `RPC_ERROR`, `TIMEOUT`, `NOT_CONFIGURED`, `KILLED`, `BUDGET_EXHAUSTED`, …).
- **Effective availability** of a deployment = lifecycle allows it ∧ deployment status allows it ∧ the instance enables it ∧ no `kill.*` flag is on. One function computes it, and each input maps to its own scope status or code.

`bun run new:protocol` creates `development`; a PR merges at `alpha` with bronze; `alpha` → `beta` needs silver and 30 days at `alpha` with no open correctness bug. Ids are never deleted.

## Consequences

- Retiring a chain or protocol is a data change with defined effects.
- Old app versions keep decoding retired ids.
- Related: [0006](0006-integration-unit.md), [0010](0010-wire-contract.md), [0026](0026-worker-and-alerts.md).
