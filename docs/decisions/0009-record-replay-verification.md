# 0009 · Record and replay verification for integrations

- Status: proposed
- Deciders: Maksim Romanov

## Context

Pull requests from forks get no secrets, archive RPC is slow and flaky, and reviewers cannot check numbers by eye. Contributors' agents need a mechanical pass or fail.

## Options

- **Live tests against RPC in CI**: needs secrets, flaky.
- **Recorded cassettes replayed in CI**, recording done by people.

## Decision

Chosen **record and replay**, because it runs on every fork PR with no network and gives the same answer every time.

- Contributors may run `bun run voidx record <family> --block=finalized` on the chain's `publicRpcs` for their own runs. Cassettes that count toward quality tiers come only from a maintainer's `/record`, signed by the maintainer ([0037](0037-ci-and-supply-chain.md)).
- CI replays signed cassettes with network calls blocked; `/live-test` re-checks them. Cassettes hold `head`, `call`, `logs` and `index` records, one type per port call ([0042](0042-integration-kit-versioning.md)).
- A generated conformance suite per family checks schema, determinism (byte-identical output across replays), no network in replay, and the domain invariants in [position-model](../concepts/position-model.md#limits); snapshots cover known wallets at pinned blocks.
- Fact-finding tools replace guessing: `bun run voidx find-deploy-block`, `check-address`, `find-wallets` (test wallets), `explain <family>`.
- One command per integration: `bun run verify:protocol <family>`.

## Consequences

- Cassettes go stale when contracts redeploy; `/live-test` and the nightly live run catch it.
- A PR without cassettes can wait under the `cassettes-needed` label instead of failing bronze.
