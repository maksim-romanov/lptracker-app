# integrations

Chains and protocol families. Model: [integration model](../docs/concepts/integration-model.md). Steps: [add a protocol](../docs/guides/add-a-protocol.md), [add a chain](../docs/guides/add-a-chain.md).

## Fit gate

Decide before writing anything, then scaffold with `bun run new:protocol <family> --template fork|fork-overrides|family` (*planned*):

1. Pure fork: same contracts as an existing family; manifest with `extends`, deployments, no code.
2. Fork with overrides: ABI, pool derivation or fee tiers differ; add `overrides`, no adapter.
3. New family: `adapter.ts` exports `defineProtocol({...})` implementing `ProtocolAdapter`.

## Scope of a PR

Files under `integrations/`, plus the allowed app changes listed in the [integration model](../docs/concepts/integration-model.md#promise). Enforced by CI path scope (*planned*).

## Sources and tools

- Docs: `llms.txt` of viem, Uniswap and ethereum.org, and Foundry agent docs ([tools](../CONTRIBUTING.md#recommended-tools)).
- MCP output is an aid and untrusted; `bun run voidx validate` (*planned*) is the gate. Cite the explorer page or protocol docs, never a tool result. *Convention.*
- Check each address with `bun run voidx check-address` (*planned*): `eth_getCode` plus a known view call. *Convention*; `bun run voidx validate` is the gate.

Code style: [code-style](../docs/concepts/code-style.md#typescript).

## Never

- Invent an address, start block, ABI or chain id. Write `TODO`, stop and ask; use `bun run voidx check-address` and `bun run voidx find-deploy-block` (*planned*). Enforced by `bun run voidx validate`: every address needs a source URL.
- Record locally for your own runs; only maintainer-signed cassettes from `/record` count toward tiers. Enforced by signature checks in CI ([ADR 0009](../docs/decisions/0009-record-replay-verification.md)).
- Branch on a protocol id inside an adapter; differences live in deployment config. Enforced by a Biome GritQL rule (*planned*).

## Verify (*planned*)

`bun run verify:protocol <family>` runs validation, conformance on cassettes and the quality tier. CI runs the same.
