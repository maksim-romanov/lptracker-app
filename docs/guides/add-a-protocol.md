# Add a protocol

From an idea to a merged family at `alpha`. Model: [integration model](../concepts/integration-model.md); rules: [integrations/AGENTS.md](../../integrations/AGENTS.md). Every `bun run` command here is *planned* (M1a). A new chain comes first: [add a chain](add-a-chain.md).

## 1. Issue

Open a *New integration* issue (form in `.github/ISSUE_TEMPLATE/new-integration.yml`, *planned* in M0) with:

| Field | Content |
|---|---|
| Protocol | Name, `protocolId`, website |
| Chains | CAIP-2 ids; each needs a chain file |
| Deployments page | The protocol's official page listing contract addresses |
| Fork of | Existing family, or "new" |
| Position token | Contract kind: ERC721Enumerable, plain ERC721, other |
| Known indexes | Subgraph IDs or protocol APIs, with links |
| Owners | GitHub handles, at least one |

No code until a maintainer labels it `accepted`. *Convention.*

## 2. Research

- Pure fork: no research file; every address still has a source URL.
- Fork with overrides or new family: `docs/research/<family>/audit-notes.md` in the [research format](../research/README.md), covering contracts per generation, position struct, fee math, custody, licences of code you port.

## 3. Choose

| Choice | Rule |
|---|---|
| Shape | The fit gate in [integrations/AGENTS.md](../../integrations/AGENTS.md#fit-gate) |
| Addresses, start blocks | From the deployments page or the explorer; check with `bun run voidx check-address` and `bun run voidx find-deploy-block`. Unknown → `TODO`, stop and ask |
| Index source per deployment | The order in [ADR 0008](../decisions/0008-pluggable-discovery.md). A third-party subgraph passes the [checklist](../research/integrations/index-sources.md#evaluation-checklist-for-a-third-party-index) first; record the result with a date in the research file |
| Staking plugin | `none` unless the NFT can sit in a staker, gauge or farm; a new plugin kind is a kit change |
| Test wallets | `bun run voidx find-wallets <family>`: one open, one closed, one out-of-range position per deployment |

## 4. Agent checkpoint

Before any code, the agent posts one comment on the issue with:

1. Shape chosen and why, in one line.
2. A table per deployment: role, address, `fromBlock`, source URL; `TODO` where unknown.
3. Index sources in order, with the checklist result for any subgraph.
4. Staking plugin and test wallets.
5. Files to create.

A maintainer answers `go` or asks for changes. The issue plus the approved checkpoint is the spec ([AGENTS.md](../../AGENTS.md#before-you-write-code)).

## 5. Build

1. `bun run new:protocol <family> --template fork|fork-overrides|family` creates the folder at `development`.
2. Fill `manifest.json`, `deployments/`, `quality.yaml`, `README.md` (methodology).
3. New family only: `adapter.ts` with `discover` and `snapshot`.
4. Ask a maintainer for `/record`; until signed cassettes exist the PR carries `cassettes-needed`.
5. `bun run verify:protocol <family>` passes, with every bronze rule `done` in `quality.yaml`.

## 6. Pull request

- One integration, files only under `integrations/` plus the allowed app changes ([promise](../concepts/integration-model.md#promise)).
- The template lists the source of every address.
- Reviewed by the `protocol-reviewer` and `security-reviewer` agents and one maintainer. Merge sets `alpha` ([state model](../concepts/state-model.md#merge-promotion-maintenance)).
