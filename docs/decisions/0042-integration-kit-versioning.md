# 0042 · Versioning the integration kit and keeping cassettes stable

- Status: proposed
- Deciders: Maksim Romanov

## Context

Every family depends on `integration-kit`. A breaking kit change touches all of them, and some families will be unmaintained. Cassettes recorded as raw JSON-RPC break whenever batching or chunk sizes change.

## Options

- **Kit changes freely**; every family is fixed in the same PR.
- **Semver with one previous major supported**, codemods, and cassettes recorded above the transport.

## Decision

Chosen **semver with one previous major supported**.

- `kitApiVersion` in each manifest is a semver range; the kit supports the current and the previous major.
- A major release ships a codemod; the kit's maintainers run it on every family, including unmaintained ones.
- A family still on an unsupported major moves to `deprecated` ([concepts/state-model.md](../concepts/state-model.md)).
- Cassettes are recorded at the port level, not as raw JSON-RPC, so batching and chunk-size changes do not invalidate them. One record type per port call, each with a canonical key:

| Record | Key | Value |
|---|---|---|
| `head` | chain, tag | block number and hash (pins `readBlock` in replay) |
| `call` | chain, contract, call data, block hash | return data, or revert data |
| `logs` | chain, address, topics, block range | logs, plus the hashes of both edge blocks |
| `index` | index source, deployment, sorted owners | refs with `seenAtBlock`, and `_meta.block` as `indexBlock` |

- Replay serves a `logs` request from any recorded range that covers it; a request no record covers fails the test.
- A bot may re-record a cassette only at the same pinned block, and only when the result matches the old provenance hash; anything else needs a maintainer ([0037](0037-ci-and-supply-chain.md)).

## Consequences

- Kit majors are rare and planned; minors are additive.
- Cassettes survive infra changes; they break only when an adapter reads something new.
