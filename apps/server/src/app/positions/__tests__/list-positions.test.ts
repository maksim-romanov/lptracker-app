import "reflect-metadata";

import { err, ok, type Result } from "neverthrow";
import type { MapPositionResult, Position } from "shared/contracts";
import { DomainError } from "shared/errors/base.error";

import { listPositions } from "../list-positions";
import { describe, expect, it, mock } from "bun:test";

class StubError extends DomainError<string> {}

const pos = (ref: string, updatedAt: string): MapPositionResult => ({
  position: {
    ref,
    address: "0xabc",
    chainId: 1,
    protocol: "uniswap-v3",
    container: { kind: "wallet", ref: "0xabc", label: "W" },
    tokens: [],
    status: { state: "in-range", stateDetail: null },
    createdAt: null,
    updatedAt,
    extension: { type: "uniswap-v3", version: 1 },
  } as Position,
  tokenMetaInputs: [],
});

const makeDeps = (impl: (chainId: number) => Promise<Result<MapPositionResult[], DomainError>>) => ({
  isKnownChainId: () => true,
  registry: {
    all: () => [
      {
        slug: "uniswap-v3",
        supportedChainIds: [1, 8453],
        listPositionsForChain: mock(async ({ chainId }: { chainId: number }) => impl(chainId)),
      },
    ],
    bySlug: () => undefined,
  },
});

describe("listPositions", () => {
  it("returns resolvedScope for every wallet×chain×protocol triple", async () => {
    const deps = makeDeps(async () => ok([]));
    const r = await listPositions({ wallets: [{ address: "0xabc", chainIds: [1, 8453] }] }, deps as never);
    expect(r.resolvedScope).toEqual([
      { address: "0xabc", chainId: 1, protocol: "uniswap-v3" },
      { address: "0xabc", chainId: 8453, protocol: "uniswap-v3" },
    ]);
  });

  it("collects partial failures without throwing", async () => {
    const deps = makeDeps(async (chainId) =>
      chainId === 8453 ? err(new StubError("UPSTREAM", "boom")) : ok([pos("uniswap-v3:1:a", "2024-01-01T00:00:00Z")]),
    );
    const r = await listPositions({ wallets: [{ address: "0xabc", chainIds: [1, 8453] }] }, deps as never);
    expect(r.positions).toHaveLength(1);
    expect(r.partialFailures).toEqual([{ protocol: "uniswap-v3", chainId: 8453, message: "boom" }]);
  });

  it("sorts by updatedAt desc with ref tie-break", async () => {
    const deps = makeDeps(async () => ok([pos("uniswap-v3:1:b", "2024-01-01T00:00:00Z"), pos("uniswap-v3:1:a", "2024-01-01T00:00:00Z")]));
    const r = await listPositions({ wallets: [{ address: "0xabc", chainIds: [1] }] }, deps as never);
    expect(r.positions.map((p) => p.ref)).toEqual(["uniswap-v3:1:a", "uniswap-v3:1:b"]);
  });
});
