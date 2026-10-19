# 0016 · MIT for shared code and integrations, AGPL-3.0 for apps, DCO sign-off

- Status: proposed
- Deciders: Maksim Romanov

## Context

Integrations should be a public good any project can reuse, while the product itself should not be closed by a fork run as a service. Relicensing later needs every contributor's consent, so the split is fixed before the first external PR.

## Options

- **AGPL-3.0 everywhere**: protects the product, discourages reuse of integrations.
- **MIT everywhere**: maximum reuse, the product can be closed.
- **Split**: MIT for shared code and integrations, AGPL-3.0 for apps and infrastructure.

## Decision

Chosen **the split**, because contributors of integrations get the least friction and the product stays open.

| License | Paths |
|---|---|
| MIT | `packages/core`, `packages/contracts`, `packages/integration-kit`, `packages/design-tokens`, `integrations/`, `e2e/` |
| AGPL-3.0-or-later | `apps/*`, `packages/infra`, `tools/` |

- `apps/ios-app` and `apps/android-app` add a GPL §7 additional permission for distribution through the App Store and Google Play, whose terms otherwise conflict with the AGPL. It must exist before the first external contribution, because it cannot be added later without every contributor's consent.
- Licensing follows REUSE: license texts in `LICENSES/`, paths annotated in `REUSE.toml`, `reuse lint` in CI.
- Contributions use DCO sign-off (`Signed-off-by:` by a human), not a CLA.

## Consequences

- MIT code never imports AGPL code; dependency-cruiser fails the build on a violation.
- Math is ported per file from MIT sources (`v3-sdk`, the MIT-licensed files of `v4-core`), with the source file's SPDX header recorded. The Uniswap SDKs are never imported, because they pull GPL dependencies; a CI license check fails on GPL or BUSL dependencies in MIT packages.
- `@chainlink/contracts` (BUSL-1.1) is never imported; feed ABIs are written by hand.
- sharp (Apache-2.0) bundles LGPL-3.0 libvips binaries, so it is allowed only in AGPL apps (`apps/server`, `apps/worker`); the license check allows LGPL there and nowhere else.
- Own subgraphs are written from scratch, never derived from the GPL `v4-subgraph`. ABIs and addresses are facts, not code.
- A DCO check runs on every PR.
