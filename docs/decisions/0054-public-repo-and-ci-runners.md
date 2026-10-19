# 0054 · Public repo from day one, GitHub-hosted runners including macOS

- Status: proposed
- Deciders: Maksim Romanov

## Context

The iOS app needs Xcode, which only runs on macOS. The owner has no spare Mac for CI, and macOS minutes on a private repo are paid.

## Options

- **Private repo with a self-hosted Mac runner**: no minute cost, but a machine to maintain and a risk for fork PRs.
- **Local-only iOS checks**: no CI cost, but iOS breaks go unnoticed until someone builds.
- **Public repo with GitHub-hosted runners**: standard runners, including macOS, are free for public repos.

## Decision

Chosen **a public repo with GitHub-hosted runners**, because it gives Linux and macOS CI at no cost and matches the open-source goal.

- The repo is public from its first commit.
- One `ci.yml`: a `changes` job decides which jobs run, the `ios` job runs on a pinned macOS image (`xcode-27` until `macos-26` carries Xcode 27) only when iOS or its inputs change, and `ci-ok` is the only required check.
- At most two macOS jobs per PR, to stay inside the free plan's concurrency.
- Details: [research/repo/ci](../research/repo/ci.md).

## Consequences

- Every commit and issue is public, so secrets and private notes never enter the repo.
- Fork PRs run with a read-only token and no secrets.
- If GitHub ends free macOS minutes for public repos, the `ios` job moves to a self-hosted runner without changing the workflow shape.
