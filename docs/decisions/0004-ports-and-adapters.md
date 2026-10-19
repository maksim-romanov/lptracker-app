# 0004 · Ports and adapters with one core package

- Status: proposed
- Deciders: Maksim Romanov

## Context

The owner wants a lightweight clean architecture. Community integrations must plug in without touching the core, and agents need boundaries they cannot cross by accident.

## Options

- **Ports and adapters with a single `core` package**: domain, ports and use cases in one package with subpath exports.
- **Separate `domain` and `application` packages**: purer layering, two hops for almost every change.
- **No explicit layers**: fastest start, boundaries erode.

## Decision

Chosen **ports and adapters with `packages/core`**, because it keeps the inward dependency rule with the fewest packages.

- `packages/core` (`core/domain`, `core/ports`, `core/use-cases`) imports nothing outside itself.
- `packages/infra` implements ports that need the outside world: transports, storage, cache, queues, push.
- `integrations/*` implement `ProtocolAdapter` using `packages/integration-kit`; they never import infra, apps or each other.
- Only `apps/*` know concrete implementations.
- Use cases are plain functions that take their dependencies ([0005](0005-dependency-injection.md)).

## Consequences

- dependency-cruiser fails the build on an inward-rule violation and on an MIT package importing AGPL code ([0016](0016-licensing-and-dco.md)).
- Adding a port is a core change reviewed by core owners.
