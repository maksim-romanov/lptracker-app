import { Service } from "core/domain/base/service";
import type { FollowingRepository } from "positions/data/following.repository";
import { GatewayPositionsRepository } from "positions/data/gateway-positions.repository";
import { FOLLOWING_REPOSITORY } from "positions/di/tokens";
import type { TGatewayPosition, TTokensMap } from "positions/domain/types";
import { inject, injectable } from "tsyringe";
import type { WalletsRepository } from "wallets/data/wallets.repository";
import { WALLETS_REPOSITORY } from "wallets/di/tokens";

import { buildWidgetSnapshot } from "../data/widget-snapshot.builder";
import type { WidgetSnapshotRepository } from "../data/widget-snapshot.repository";
import { WIDGET_SNAPSHOT_REPOSITORY } from "../di/tokens";

/**
 * Widget snapshot orchestrator. Pulls current wallets, fetches positions,
 * filters by followed refs, and writes a raw-orientation snapshot to the
 * App Group. Invert is handled per-surface at render time.
 *
 * Triggered explicitly from wallet/positions use cases, the BG task, and
 * AppInit. No store subscriptions.
 */
@injectable()
export class WidgetSnapshotService extends Service {
  private inflight: Promise<void> | null = null;

  constructor(
    @inject(WIDGET_SNAPSHOT_REPOSITORY) private readonly repo: WidgetSnapshotRepository,
    @inject(FOLLOWING_REPOSITORY) private readonly followingRepo: FollowingRepository,
    @inject(GatewayPositionsRepository) private readonly positionsRepo: GatewayPositionsRepository,
    @inject(WALLETS_REPOSITORY) private readonly walletsRepo: WalletsRepository,
  ) {
    super();
  }

  async revalidate(): Promise<void> {
    if (this.inflight) return this.inflight;
    this.inflight = this.doRevalidate().finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }

  private async doRevalidate(): Promise<void> {
    const wallets = this.walletsRepo.getAll().map((w) => ({
      address: w.address,
      chainIds: [...w.chainIds],
    }));

    const data = await this.fetchPositions(wallets);
    if (data === null) return;

    const snapshot = buildWidgetSnapshot({
      positions: data.positions,
      tokens: data.tokens,
      following: new Set(this.followingRepo.getAll()),
      now: Date.now(),
    });
    await this.repo.write(snapshot);
  }

  private async fetchPositions(
    wallets: readonly { address: string; chainIds: number[] }[],
  ): Promise<{ positions: readonly TGatewayPosition[]; tokens: TTokensMap } | null> {
    if (wallets.length === 0) return { positions: [], tokens: {} };
    try {
      const data = await this.positionsRepo.list({ wallets });
      return { positions: data.data, tokens: data.tokens };
    } catch (error) {
      this.logger.warn("Widget snapshot revalidation: positions fetch failed", { error });
      return null;
    }
  }
}
