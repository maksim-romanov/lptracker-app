# @depthly/catalog

Source of truth for supported networks and protocols, shared between server and mobile.

## Layout

- `src/networks.ts` — `NETWORKS` array + `TKnownChainId` literal union.
- `src/protocols.ts` — `PROTOCOLS_META` record + `TKnownProtocolSlug` literal union.
- `src/types.ts` — `INetworkEntry`, `IProtocolMeta` interfaces.
- `src/index.ts` — barrel.

## Adding a new protocol

1. **Catalog entry** — append to `src/protocols.ts`:

   ```ts
   "aave-v3": {
     slug: "aave-v3",
     version: "3",
     label: "Aave V3",
     brandColor: "#B6509E",
     supportedChainIds: [1, 8453, 42161] as const,
     capabilities: ["lending", "borrowing"] as const,
     extensionVersion: 1,
   },
   ```

2. **Server feature module** in `apps/server/src/features/aave-v3/`:
   - Implement Valibot `extensionSchema` (with `type: v.literal("aave-v3")`).
   - Implement repository + use cases.
   - Register a `ProtocolEntry` in `apps/server/src/app/protocols/` and add it to the registry.
   - Optionally provide `mapError` to keep `presentation/v1/error-mapper.ts` protocol-agnostic.

3. **Mobile feature plugin** in `apps/mobile/src/features/aave-v3/`:
   - Implement `domain/aave-v3.vm.ts`, `data/aave-v3.mapper.ts`, presentation components.
   - Export `aaveV3Plugin: IProtocolPlugin<"aave-v3">` from `index.ts`.

4. **Wire into the mobile registry** in `apps/mobile/src/app/protocol-plugins.ts`:

   ```ts
   "aave-v3": aaveV3Plugin,
   ```

   TypeScript will refuse to compile until this line is added — that is intentional;
   the exhaustiveness check is the safety net.

5. **Regenerate + verify** from repo root:

   ```bash
   bun run codegen
   bun run typecheck
   bun run lint
   bun test
   ```

## Adding a new chain

1. Append the network to `src/networks.ts` (chainId + slug + name + nativeCurrency + explorerUrl).
2. Update any protocol's `supportedChainIds` in `src/protocols.ts` that should support the new chain.
3. Run `bun run typecheck` across the workspace.
