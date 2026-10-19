# 0003 · Protocol logic and every derived number live on the server

- Status: proposed
- Deciders: Maksim Romanov

## Context

Position math (Q64.96 prices, tick ranges, fee growth modulo 2^256, gauge rewards) is easy to get subtly wrong. The earlier Depthly project duplicated display and formatting logic in three to four places, and the copies drifted.

## Options

- **Server computes everything, clients format**: one implementation, thin clients.
- **Clients compute from raw on-chain values**: offline math, but three implementations of the same math.

## Decision

Chosen **server computes everything**, because protocol math implemented once in TypeScript cannot drift between platforms, and adding a protocol never needs an app release.

- The server returns token amounts, owed fees, rewards and ranges as decimal strings, and ranges as prices in both orientations with a bar position.
- Clients only format: locale, compact notation, units. They never multiply by decimals or evaluate ticks.
- Formatting follows hand-written golden vectors in `packages/contracts`, consumed by the TS, Swift and Kotlin tests.

## Consequences

- Clients stay thin; their domain models mirror DTOs.
- Offline, clients show the last response with its time; nothing is recomputed on the device.
- The golden-vector tests are the check that formatting agrees across platforms.
