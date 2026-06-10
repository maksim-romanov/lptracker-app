import { observable } from "mobx";
import type { TGatewayPosition, TTokensMap } from "positions/domain/types";

import { buildWidgetSnapshot } from "../widget-snapshot.builder";
import { describe, expect, it, mock } from "bun:test";

// Plain re-implementation of WidgetSnapshotService.doRefresh that we can test
// without dragging in the Service base class (which transitively imports RN).
// If the service contract changes, this re-implementation must stay in sync
// with src/widgets/data/widget-snapshot.service.ts → doRefresh.
async function doRefresh(deps: {
  positions: readonly TGatewayPosition[];
  tokens: TTokensMap;
  following: { refs: Set<string>; prune: (valid: ReadonlySet<string>) => void };
  viewPrefs: { invertedRefs: Set<string>; pruneInverted: (valid: ReadonlySet<string>) => void };
  repo: { write: (snapshot: unknown) => Promise<void> };
  now: number;
}): Promise<void> {
  const validRefs = new Set(deps.positions.map((p) => p.ref));
  deps.following.prune(validRefs);
  deps.viewPrefs.pruneInverted(validRefs);
  const snapshot = buildWidgetSnapshot({
    positions: deps.positions,
    following: new Set(deps.following.refs),
    invertedRefs: new Set(deps.viewPrefs.invertedRefs),
    tokens: deps.tokens,
    now: deps.now,
  });
  await deps.repo.write(snapshot);
}

function makeFollowing(initialRefs: string[]) {
  const refs = observable.set<string>(initialRefs);
  return {
    refs,
    prune: mock((validRefs: ReadonlySet<string>) => {
      for (const ref of refs) if (!validRefs.has(ref)) refs.delete(ref);
    }),
  };
}

function makeViewPrefs(initialRefs: string[]) {
  const invertedRefs = observable.set<string>(initialRefs);
  return {
    invertedRefs,
    pruneInverted: mock((validRefs: ReadonlySet<string>) => {
      for (const ref of invertedRefs) if (!validRefs.has(ref)) invertedRefs.delete(ref);
    }),
  };
}

function makeRepo() {
  return { write: mock(async (_: unknown) => {}) };
}

function makePosition(ref: string): TGatewayPosition {
  return {
    ref,
    address: "0xabc",
    chainId: 1,
    protocol: "uniswap-v3",
    container: { kind: "pool", ref: "0xpool", label: "WETH / USDC 0.30%" },
    tokens: [
      {
        role: "principal",
        tokenRef: "1:0xweth",
        balance: { raw: "0", decimals: 18, formatted: "0", tokenRef: "1:0xweth" },
      },
      {
        role: "principal",
        tokenRef: "1:0xusdc",
        balance: { raw: "0", decimals: 6, formatted: "0", tokenRef: "1:0xusdc" },
      },
    ],
    status: { state: "in-range", stateDetail: null },
    extension: {
      type: "uniswap-v3",
      version: 1,
      tickLower: -100,
      tickUpper: 100,
      liquidity: "1",
      feeTier: 3000,
      feeTierLabel: "0.30%",
      nftTokenId: "1",
      pool: { address: "0xpool", currentTick: 0, sqrtPriceX96: "1" },
    },
    createdAt: null,
    updatedAt: "2026-06-10T00:00:00.000Z",
  };
}

const tokens: TTokensMap = {
  "1:0xweth": { symbol: "WETH", decimals: 18, iconUrl: "" },
  "1:0xusdc": { symbol: "USDC", decimals: 6, iconUrl: "" },
};

describe("WidgetSnapshotService.refresh contract", () => {
  it("prunes stale following refs before writing the snapshot", async () => {
    const following = makeFollowing(["uniswap-v3:1:1", "uniswap-v3:1:GONE"]);
    const viewPrefs = makeViewPrefs([]);
    const repo = makeRepo();

    await doRefresh({
      positions: [makePosition("uniswap-v3:1:1")],
      tokens,
      following,
      viewPrefs,
      repo,
      now: 1000,
    });

    expect(following.prune).toHaveBeenCalledTimes(1);
    expect([...following.refs]).toEqual(["uniswap-v3:1:1"]);
    expect(repo.write).toHaveBeenCalledTimes(1);
  });

  it("prunes stale inverted refs before writing the snapshot", async () => {
    const following = makeFollowing([]);
    const viewPrefs = makeViewPrefs(["uniswap-v3:1:1", "uniswap-v3:1:GONE"]);
    const repo = makeRepo();

    await doRefresh({
      positions: [makePosition("uniswap-v3:1:1")],
      tokens,
      following,
      viewPrefs,
      repo,
      now: 1000,
    });

    expect(viewPrefs.pruneInverted).toHaveBeenCalledTimes(1);
    expect([...viewPrefs.invertedRefs]).toEqual(["uniswap-v3:1:1"]);
    expect(repo.write).toHaveBeenCalledTimes(1);
  });

  it("calls prune before repo.write so the snapshot reflects pruned refs", async () => {
    const calls: string[] = [];
    const following = {
      refs: observable.set<string>([]),
      prune: mock(() => {
        calls.push("prune-following");
      }),
    };
    const viewPrefs = {
      invertedRefs: observable.set<string>([]),
      pruneInverted: mock(() => {
        calls.push("prune-inverted");
      }),
    };
    const repo = {
      write: mock(async () => {
        calls.push("write");
      }),
    };

    await doRefresh({
      positions: [makePosition("uniswap-v3:1:1")],
      tokens,
      following,
      viewPrefs,
      repo,
      now: 1000,
    });

    expect(calls).toEqual(["prune-following", "prune-inverted", "write"]);
  });
});
