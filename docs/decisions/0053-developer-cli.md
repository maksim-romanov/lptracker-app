# 0053 · The `voidx` developer CLI lives in its own AGPL workspace

- Status: proposed
- Deciders: Maksim Romanov

## Context

Contributors and maintainers need fact-finding and admin commands: validate integration files, check addresses, find deploy blocks and test wallets, grant plans. Some commands read chains through the RPC provider pool and write to the database, which live in the AGPL `packages/infra`.

## Options

- **Inside `packages/integration-kit`**: one package for integration authors, but MIT code cannot import AGPL `infra`.
- **Scripts per package**: no shared entry point, duplicated config and RPC setup.
- **A separate workspace `tools/voidx-cli`**: one entry point, free to use `infra`.

## Decision

Chosen **`tools/voidx-cli` under AGPL-3.0-or-later**, because commands need `infra` and the MIT packages must never import it ([0016](0016-licensing-and-dco.md)).

- Package `@voidx/cli`, run as `bun run voidx <command>`.
- It may import `packages/integration-kit` and `packages/infra`; nothing imports it.
- Commands (*planned*): `validate` (M0), `check-address`, `find-deploy-block`, `find-wallets`, `explain` ([0009](0009-record-replay-verification.md)), `grant` and `grants` ([0043](0043-plans-and-entitlements.md)).

## Consequences

- `integration-kit` stays MIT and reusable outside VoidX.
- Integration authors depend on an AGPL tool only to run it, not to link it.
- dependency-cruiser adds `tools/` to the AGPL side of the MIT rule.
