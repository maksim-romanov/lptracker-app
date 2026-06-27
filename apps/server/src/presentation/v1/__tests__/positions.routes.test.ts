import "reflect-metadata";

import { ok, type Result } from "neverthrow";
import type { MapPositionResult, Position } from "shared/contracts";
import type { DomainError } from "shared/errors/base.error";

import { protocolRegistry } from "../../../app/protocols/registry";
import { positionsRoutes } from "../positions.routes";
import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";

// Build a minimal Position for a given ref/updatedAt.
const makePosition = (ref: string, updatedAt: string): Position => ({
  ref,
  address: "0x1111111111111111111111111111111111111111",
  chainId: 1,
  protocol: "uniswap-v3",
  container: { kind: "wallet", ref: "0x1111", label: "Wallet" },
  tokens: [],
  status: { state: "in-range", stateDetail: null },
  createdAt: null,
  updatedAt,
  extension: { type: "uniswap-v3", version: 1 },
});

const mapResult = (ref: string, updatedAt: string): MapPositionResult => ({
  position: makePosition(ref, updatedAt),
  tokenMetaInputs: [],
});

// Mutable fake protocol used by the stubbed registry.
const fakeProtocol = {
  slug: "uniswap-v3",
  version: "1",
  supportedChainIds: [1, 8453],
  capabilities: [],
  extensionVersion: "1",
  extensionSchema: {} as never,
  listPositionsForChain: mock(
    async (_params: { chainId: number }): Promise<Result<MapPositionResult[], DomainError>> => ok([] as MapPositionResult[]),
  ),
  getPositionByRef: mock(async () => ok(mapResult("uniswap-v3:1:1", "2024-01-01T00:00:00Z"))),
};

const WALLET = "0x1111111111111111111111111111111111111111";

const request = (qs: string) => positionsRoutes.request(`/?${qs}`);

describe("GET /api/v1/positions (characterization)", () => {
  let allSpy: { mockRestore(): void };
  let bySlugSpy: { mockRestore(): void };

  beforeEach(() => {
    fakeProtocol.listPositionsForChain.mockReset();
    fakeProtocol.listPositionsForChain.mockImplementation(async () => ok([] as MapPositionResult[]));
    allSpy = spyOn(protocolRegistry, "all").mockReturnValue([fakeProtocol as never]);
    bySlugSpy = spyOn(protocolRegistry, "bySlug").mockImplementation((slug: string) =>
      slug === "uniswap-v3" ? (fakeProtocol as never) : undefined,
    );
  });

  afterEach(() => {
    allSpy.mockRestore();
    bySlugSpy.mockRestore();
  });

  it("always sets X-Resolved-Scope and returns 200 with empty data", async () => {
    const res = await request(`wallets=${WALLET}:1`);
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Resolved-Scope")).toBe(JSON.stringify([{ address: WALLET, chainId: 1, protocol: "uniswap-v3" }]));
    expect(res.headers.get("Warning")).toBeNull();
    expect(res.headers.get("X-Partial-Failures")).toBeNull();
    const body = await res.json();
    expect(body.data).toEqual([]);
  });

  it("sorts positions by updatedAt desc, ref.localeCompare tie-break", async () => {
    fakeProtocol.listPositionsForChain.mockImplementation(async () =>
      ok([
        mapResult("uniswap-v3:1:b", "2024-01-01T00:00:00Z"),
        mapResult("uniswap-v3:1:a", "2024-01-01T00:00:00Z"),
        mapResult("uniswap-v3:1:c", "2024-02-01T00:00:00Z"),
      ]),
    );
    const res = await request(`wallets=${WALLET}:1`);
    const body = await res.json();
    expect(body.data.map((p: Position) => p.ref)).toEqual(["uniswap-v3:1:c", "uniswap-v3:1:a", "uniswap-v3:1:b"]);
  });

  it("requests at most MAX_PER_SOURCE (200) positions per source", async () => {
    // 200 mirrors the route's internal MAX_PER_SOURCE cap; assert the upstream call arg, not response length.
    await request(`wallets=${WALLET}:1`);
    const callArg = fakeProtocol.listPositionsForChain.mock.calls[0]?.[0] as unknown as { pagination: { limit: number; offset: number } };
    expect(callArg.pagination).toEqual({ limit: 200, offset: 0 });
  });

  it("emits Warning + X-Partial-Failures only when a source fails", async () => {
    const { err } = await import("neverthrow");
    const { DomainError } = await import("shared/errors/base.error");
    // DomainError is abstract — create a minimal concrete subclass for the stub.
    class StubError extends DomainError<string> {}
    fakeProtocol.listPositionsForChain.mockImplementation(async ({ chainId }: { chainId: number }) =>
      chainId === 8453 ? err(new StubError("UPSTREAM", "boom")) : ok([mapResult("uniswap-v3:1:a", "2024-01-01T00:00:00Z")]),
    );
    const res = await request(`wallets=${WALLET}:1,8453`);
    expect(res.status).toBe(200);
    expect(res.headers.get("Warning")).toContain("partial-results");
    expect(res.headers.get("X-Partial-Failures")).toContain("8453");
    const body = await res.json();
    expect(body.data).toHaveLength(1);
  });

  it("rejects unknown protocols with 400", async () => {
    const res = await request(`wallets=${WALLET}:1&protocols=sushi`);
    expect(res.status).toBe(400);
  });
});
