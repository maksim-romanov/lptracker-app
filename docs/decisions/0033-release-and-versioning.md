# 0033 · Release per component with semver and phased store rollouts

- Status: proposed
- Deciders: Maksim Romanov

## Context

Server, iOS and Android release on different schedules; store apps stay installed for months; self-hosters upgrade on their own time; integrations change often.

## Options

- **One version for the whole repo.**
- **Per-component releases with release-please**, semver and tags per component.

## Decision

Chosen **per-component releases**, because each component has its own users and upgrade path.

- release-please opens release PRs per component from conventional commits; tags `server-v*`, `worker-v*`, `ios-v*`, `android-v*`, `kit-v*`.
- Server and worker images are published to GHCR, signed and tagged with version and commit SHA ([0037](0037-ci-and-supply-chain.md)).
- Integrations ship inside server releases; the official instance releases at least weekly while integrations are being added.
- iOS and Android go through fastlane to TestFlight and the Play internal track, then a phased rollout.
- `minClientVersion` rises only when oasdiff reports a breaking change the old app cannot survive, and `/api/v1` stays served 12 months after `/api/v2` ([0010](0010-wire-contract.md)).
- Every server release carries upgrade notes for self-hosters: migrations, config changes, removed options.

## Consequences

- Changelogs come from commit messages, so conventional commits are required.
- A bad server release rolls back by redeploying the previous image ([0035](0035-data-lifecycle.md)).
- Kit versioning follows [0042](0042-integration-kit-versioning.md).
