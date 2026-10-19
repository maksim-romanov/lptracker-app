# 0013 · Official instance and first-class self-hosting

- Status: proposed
- Deciders: Maksim Romanov

## Context

The server learns which addresses people watch. For an open-source tracker, self-hosting is the privacy answer, while most users will use the official instance from the store apps.

## Options

- **Official instance only**.
- **Official instance plus first-class self-hosting**.
- **Self-hosting only**: store apps have nothing to connect to by default.

## Decision

Chosen **official instance plus first-class self-hosting**, started with `docker compose`.

- Official instance origin: [0044](0044-domain-as-configuration.md).
- `instance.config` is typed and validated at boot: RPC pools per chain, index endpoints per deployment, keys, enabled deployments. A missing entry becomes a `not_configured` scope, never a crash.
- Apps can point to any server; `GET /api/v1/meta` tells them which features it has ([0010](0010-wire-contract.md)).
- Raw addresses are never logged; IPs are dropped after the rate-limit window; deleting an account deletes everything linked to it.

## Consequences

- Push to store apps from a self-hosted server needs a relay through the official instance; until it exists, those users get no push ([0014](0014-push-via-onesignal.md)).
- RPC, index and push providers see the queried addresses; self-hosting with your own RPC avoids that.
- Lite mode (no Redis) arrives in M6.
