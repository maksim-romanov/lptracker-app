# packages

Shared code. What each package holds, its license and the dependency direction: [architecture](../docs/architecture.md#packages-and-dependency-direction).

## Rules

- `contracts` wire fields use open strings; never add `z.enum` to a wire field ([0010](../docs/decisions/0010-wire-contract.md)). Enforced by a lint rule on `packages/contracts` (*planned*).
- Port math only from MIT sources such as the Uniswap v3-sdk, never from GPL contracts ([0016](../docs/decisions/0016-licensing-and-dco.md)). Enforced by review and license headers.
- Use cases are plain functions taking their dependencies; no container, no decorators ([0005](../docs/decisions/0005-dependency-injection.md)). Enforced by a lint ban on `reflect-metadata` and decorators.
- `infra` has one subfolder per port. *Convention.*

Code style: [code-style](../docs/concepts/code-style.md#typescript); core stays pure, with time and I/O passed in.

## Stop and ask

- A change to `packages/core` or `packages/contracts` without an ADR or an approved spec.
