# Add a chain

From a chain id to a merged chain file. Fields: [chain file](../concepts/integration-model.md#chain-file). Sources, the probe and the values for the MVP chains: [chain parameters research](../research/integrations/chain-parameters.md). Every `bun run` command here is *planned*: `codegen` and `voidx validate` in M0, `voidx check-address` in M1a.

## 1. Issue

Open a *New integration* issue for the chain, like a protocol ([add a protocol](add-a-protocol.md#1-issue)). EVM chains only; another VM is a core change ([promise](../concepts/integration-model.md#promise)).

## 2. Fill the file

Create `integrations/chains/eip155-<id>.json`. Take each field from the source the [research table](../research/integrations/chain-parameters.md#where-each-field-comes-from) names, in its order, and put the source URL next to every address. Never copy an address from a knowledge pack or a tool answer.

| Field | Rule |
|---|---|
| `readPolicy.tag` | `safe` when the probe measures its lag at 60 s or less, else `latest` ([ADR 0007](../decisions/0007-data-rule-and-read-block.md)) |
| `requiresArchive` | From probe step 4: `true` when any non-archive URL fails `eth_call` at `head - 2 x lagBlocks` |
| `maxHeadLagBlocks` | `max(2, ceil(30 s / blockTime))` (*proposal*) |
| `maxIndexLagBlocks` | `ceil(600 s / blockTime)`, at most 3 × the smallest `maxBlockRange` the probe found (*proposal*) |
| `snapshotTtlSeconds` | 20 (*proposal*) |
| `publicRpcs` | Only URLs from the chain's own docs, https; none listed → `TODO`, stop and ask |
| `priceIds` | DefiLlama: the `coins.llama.fi` prefix; CoinGecko: the `asset_platforms` id whose `chain_identifier` is the chain id |
| `logo` | The chain's brand kit when its terms allow redistribution; the PR names the licence URL |
| `status` | `active` |

`blockTime` in these formulas is measured over 1,000 blocks, twice an hour apart. Values marked *proposal* wait for the owner's check against real pool data in M1a.

## 3. Probe and check

1. Run the [public RPC probe](../research/integrations/chain-parameters.md#public-rpc-probe-run-before-adding-a-url) on every URL in `publicRpcs`; paste the results with the date into the PR.
2. `bun run voidx check-address` on `wrappedNative` and `multicall3`; the Multicall3 code hash equals Ethereum's; on a mismatch write `TODO`, stop and ask.
3. `bun run codegen` writes the Chainlink feeds file; never edit it ([prices and logos](../concepts/prices-and-logos.md#chainlink)).
4. `bun run voidx validate` passes.

## 4. Pull request

One chain file per PR, reviewed by the `security-reviewer` agent (URL allowlist, [ADR 0036](../decisions/0036-integration-trust.md)) and a maintainer. A chain adds no protocol: each family gets its deployment for the chain in its own PR ([add a protocol](add-a-protocol.md)).
