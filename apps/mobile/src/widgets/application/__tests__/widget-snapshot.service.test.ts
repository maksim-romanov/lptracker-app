import { container } from "core/di/container";
import { APP_INFO, DEVICE_INFO, LOGGER } from "core/di/tokens";
import type { AppInfoService, DeviceInfoService, Logger } from "core/services";
import type { FollowingRepository } from "positions/data/following.repository";
import type { GatewayPositionsRepository, TPositionsListResult } from "positions/data/gateway-positions.repository";
import type { TGatewayPosition } from "positions/domain/types";
import type { WalletsRepository } from "wallets/data/wallets.repository";

import type { WidgetSnapshotRepository } from "../../data/widget-snapshot.repository";
import type { TWidgetSnapshot } from "../../domain/types";
import { WidgetSnapshotService } from "../widget-snapshot.service";
import { beforeAll, describe, expect, it } from "bun:test";

const noopLogger = { extend: () => noopLogger, debug: () => {}, info: () => {}, warn: () => {}, error: () => {} };

beforeAll(() => {
  container.registerInstance(LOGGER, noopLogger as unknown as Logger);
  container.registerInstance(APP_INFO, {} as AppInfoService);
  container.registerInstance(DEVICE_INFO, {} as DeviceInfoService);
});

const position: TGatewayPosition = {
  ref: "uniswap-v3:1:12345",
  address: "0xabc",
  chainId: 1,
  protocol: "uniswap-v3",
  container: { kind: "pool", ref: "0xpool", label: "WETH / USDC 0.30%" },
  tokens: [
    {
      role: "principal",
      tokenRef: "1:0xweth",
      balance: { raw: "1000000000000000000", decimals: 18, formatted: "1.0", tokenRef: "1:0xweth" },
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
    nftTokenId: "12345",
    pool: { address: "0xpool", currentTick: 0, sqrtPriceX96: "1" },
  },
} as unknown as TGatewayPosition;

const buildService = (list: () => Promise<TPositionsListResult>) => {
  const written: TWidgetSnapshot[] = [];
  const snapshotRepo = {
    write: async (snapshot: TWidgetSnapshot) => {
      written.push(snapshot);
    },
  } as unknown as WidgetSnapshotRepository;
  const followingRepo = { getAll: () => [position.ref] } as unknown as FollowingRepository;
  const positionsRepo = { list } as unknown as GatewayPositionsRepository;
  const walletsRepo = { getAll: () => [{ address: "0xabc", chainIds: [1] }] } as unknown as WalletsRepository;

  return { service: new WidgetSnapshotService(snapshotRepo, followingRepo, positionsRepo, walletsRepo), written };
};

describe("WidgetSnapshotService", () => {
  it("writes a snapshot when every source answered", async () => {
    const { service, written } = buildService(async () => ({
      data: [position],
      tokens: {},
      meta: { partialFailures: [] },
    }));

    await service.revalidate();

    expect(written).toHaveLength(1);
    expect(written[0]?.positions.map((p) => p.ref)).toEqual([position.ref]);
  });

  it("leaves the previous snapshot in place when a source failed", async () => {
    const { service, written } = buildService(async () => ({
      data: [],
      tokens: {},
      meta: { partialFailures: [{ protocol: "uniswap-v3", chainId: 42161, message: "index is stale" }] },
    }));

    await service.revalidate();

    // Overwriting here would drop the pinned ref, and the widget renders a missing ref as
    // "This position is no longer available" rather than as stale data.
    expect(written).toHaveLength(0);
  });
});
