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
- Cassettes are recorded at the `ChainReader` call level with canonical keys (chain, contract, call data, block hash), not as raw JSON-RPC, so batching and chunk-size changes do not invalidate them.
- A bot may re-record a cassette only at the same pinned block, and only when the result matches the old provenance hash; anything else needs a maintainer ([0037](0037-ci-and-supply-chain.md)).

## Consequences

- Kit majors are rare and planned; minors are additive.
- Cassettes survive infra changes; they break only when an adapter reads something new.
