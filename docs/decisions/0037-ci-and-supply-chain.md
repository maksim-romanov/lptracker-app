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
- The job that runs PR code has `permissions: {}`, no secrets, runs in an ephemeral container, never saves a cache and restores only from its own cache key namespace.
- A separate trusted job, which runs no PR code, mints a short-lived OIDC token scoped to the recording proxy and hands it over; the proxy enforces a JSON-RPC method allowlist and a quota.
- Cassettes count toward quality tiers only when a maintainer signs them.

Deploy: cloud trust policies pin the `job_workflow_ref` of the deploy workflow on `main`, and deploy jobs run in a protected `production` environment with required reviewers.

Unattended agents (launcher runs, CI agent jobs):

- Run with the sandbox enabled and no unsandboxed commands; writes stay inside the agent's worktree.
- Network reaches only package registries and mise tool sources.
- Allow rules name scripts (`bun run check`, `bun run codegen`), never a bare interpreter or shell.
- iOS steps that the macOS Seatbelt sandbox breaks run under a separate macOS user with no git, `gh` or SSH credentials.

Supply chain:

- GitHub Actions pinned by commit SHA; `bun install --frozen-lockfile`.
- Renovate with a minimum release age for new versions.
- Images signed with cosign keyless, with SLSA provenance and an SBOM; release tags signed.
- `reuse lint` and a license check that fails on GPL or BUSL dependencies in MIT packages ([0016](0016-licensing-and-dco.md)).

## Consequences

- A contributor without keys waits for a maintainer's `/record`; the `cassettes-needed` label parks the PR.
- Maintainers keep a recording proxy running; its quota counts toward the budget in [0032](0032-deployment-and-cost.md).
