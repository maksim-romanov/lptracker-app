import "reflect-metadata";

import { ok } from "neverthrow";

import { webRoutes } from "../positions.routes";
import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { protocolRegistry } from "#app/protocols/registry";
import type { MapPositionResult, Position } from "#shared/contracts";

const REF = "uniswap-v3:1:42";

// The v3 contract mapper never emits this state; a client asking for one position is how a
// state the card was not built for reaches the mapper on its own.
const positionWith = (state: string): Position => ({
  ref: REF,
  address: "0x1111111111111111111111111111111111111111",
  chainId: 1,
  protocol: "uniswap-v3",
  container: { kind: "pool", ref: "uniswap-v3:1:0xpool", label: "WETH/USDC 0.30%" },
  tokens: [],
  status: { state, stateDetail: null },
  createdAt: null,
  updatedAt: "2026-01-01T00:00:00Z",
  feeAccrual: { mode: "unknown", reason: null, destination: null },
  yieldSources: [],
  range: { lower: "1800", upper: "2200", current: "2000", baseTokenRef: "1:0xa", quoteTokenRef: "1:0xb" },
  stats: [],
  extension: {
    type: "uniswap-v3",
    version: 1,
    tickLower: -600,
    tickUpper: 600,
    liquidity: "1",
    feeTier: 3000,
    feeTierLabel: "0.30%",
    nftTokenId: "42",
    pool: { address: "0xpool", currentTick: 0, sqrtPriceX96: "79228162514264337593543950336" },
  },
});

const stubRegistry = (state: string) =>
  spyOn(protocolRegistry, "bySlug").mockReturnValue({
    slug: "uniswap-v3",
    getPositionByRef: async () => ok({ position: positionWith(state), tokenMetaInputs: [] } as MapPositionResult),
  } as never);

describe("web position routes, on a position the card mapper cannot render", () => {
  let spy: { mockRestore(): void } | undefined;

  afterEach(() => spy?.mockRestore());

  it("answers the item route with the banner rather than a 500", async () => {
    spy = stubRegistry("not-a-real-state");

    const res = await webRoutes.request(`/positions/${REF}/item`);

    expect(res.status).toBe(200);
    expect(await res.text()).toContain("This position could not be displayed");
  });

  it("answers the detail route with the banner rather than a 500", async () => {
    spy = stubRegistry("not-a-real-state");

    const res = await webRoutes.request(`/positions/${REF}/detail`);

    expect(res.status).toBe(200);
    expect(await res.text()).toContain("This position could not be displayed");
  });

  it("still renders a state the mapper does know", async () => {
    spy = stubRegistry("in-range");

    const res = await webRoutes.request(`/positions/${REF}/item`);

    expect(res.status).toBe(200);
    expect(await res.text()).not.toContain("could not be displayed");
  });
});
