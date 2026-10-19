# 0006 · The integration unit

- Status: proposed
- Deciders: Maksim Romanov

## Context

Adding a chain or protocol must look like adding an integration, done mostly by community maintainers with coding agents. Home Assistant, OpenTelemetry and DefiLlama show that a manifest, a scaffold and a mechanical quality bar keep such ecosystems healthy.

## Options

- **One folder per family under `integrations/`** with manifest, deployments and generated artefacts.
- **One package per brand**: duplicates code for Aerodrome and Velodrome.
- **Registry list in core**: every integration edits core.

## Decision

Chosen **`integrations/`** with three kinds of unit:

- `integrations/chains/<caip2 file>.json`: data only. Never deleted, only deprecated.
- `integrations/protocols/<family>/`: `manifest.json`, `adapter.ts` (new families only), `deployments/<protocolId>@<chain file>.json`, `quality.yaml`, `cassettes/`, `conformance.gen.test.ts` (generated), `adapter.test.ts`, `README.md`.
- `integrations/subgraphs/<family>/`: only where no cheaper index source exists ([0008](0008-pluggable-discovery.md)).

`adapter.ts` exports `defineProtocol({...})` implementing the `ProtocolAdapter` port. A manifest is a pure fork (`extends`), a fork with `overrides` (ABI, pool derivation, fee tiers) or a new family. A deployment lists contracts with role, address, block range and source URL, a list of index sources, a staking plugin, a status and optional `supersededBy`. Lifecycle levels and quality tiers follow the [state model](../concepts/state-model.md); `bun run new:protocol` creates `development`; merge needs bronze and sets `alpha`.

## Consequences

- The core packages (`packages/core`, `packages/contracts`, `packages/infra`) never change for an integration; CI blocks the PR if they do.
- Apps show a new integration with no change through generic rendering. App changes are minimal and optional, from the list in the [integration model](../concepts/integration-model.md#promise); CI flags them for app owners.
- The registry and support matrix are built, not committed. CODEOWNERS and the apps' metadata snapshot are committed by a bot after merge, so an integration PR never edits generated files.
- New index source or staking plugin kinds are `integration-kit` changes, reviewed like core.
