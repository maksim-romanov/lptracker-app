# 0037 · CI runs contributor code without secrets and releases are signed

- Status: proposed
- Deciders: Maksim Romanov

## Context

Fork PRs carry code from strangers; recording cassettes needs RPC keys; the project ships server images and store apps that users trust.

## Options

- **Convenience CI**: `pull_request_target` and secrets available to PR jobs.
- **Least-privilege CI** with a separate, pinned recording path and signed artifacts.

## Decision

Chosen **least-privilege CI**.

PR code:

- Runs only under `pull_request` with a read-only token and no secrets; replays cassettes ([0009](0009-record-replay-verification.md)).

Recording (`/record`):

- A maintainer comment triggers it and pins the commented commit SHA.
- The job runs in an ephemeral container with no secrets.
- It reaches RPC only through a recording proxy, authenticated with a short-lived OIDC token, a JSON-RPC method allowlist and a quota.
- Cassettes count toward quality tiers only when a maintainer signs them.

Supply chain:

- GitHub Actions pinned by commit SHA; `bun install --frozen-lockfile`.
- Renovate with a minimum release age for new versions.
- Images signed with cosign keyless, with SLSA provenance and an SBOM; release tags signed.
- `reuse lint` and a license check that fails on GPL or BUSL dependencies in MIT packages ([0016](0016-licensing-and-dco.md)).

## Consequences

- A contributor without keys waits for a maintainer's `/record`; the `cassettes-needed` label parks the PR.
- Maintainers keep a recording proxy running; its quota counts toward the budget in [0032](0032-deployment-and-cost.md).
