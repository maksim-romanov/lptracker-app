import { Service } from "core/domain/base/service";
import type { FollowingRepository } from "positions/data/following.repository";
import { GatewayPositionsRepository } from "positions/data/gateway-positions.repository";
import type { PositionViewPrefsRepository } from "positions/data/position-view-prefs.repository";
import { FOLLOWING_REPOSITORY, POSITION_VIEW_PREFS_REPOSITORY } from "positions/di/tokens";
import type { TGatewayPosition, TTokensMap } from "positions/domain/types";
import { inject, injectable } from "tsyringe";
import type { WalletsRepository } from "wallets/data/wallets.repository";
import { WALLETS_REPOSITORY } from "wallets/di/tokens";

import { buildWidgetSnapshot } from "../data/widget-snapshot.builder";
import type { WidgetSnapshotRepository } from "../data/widget-snapshot.repository";
import { WIDGET_SNAPSHOT_REPOSITORY } from "../di/tokens";

/**
 * Widget snapshot orchestrator. Reads followed positions and view prefs,
 * intersects with the latest positions from the gateway, and writes a snapshot
 * to the App Group consumed by the SwiftUI widget.
 *
 * Triggered explicitly from wallet mutation use cases, the positions refetch
 * success path, the BG task, and AppInit. No store subscriptions.
 */
@injectable()
export class WidgetSnapshotService extends Service {
  private inflight: Promise<void> | null = null;

  constructor(
    @inject(WIDGET_SNAPSHOT_REPOSITORY) private readonly repo: WidgetSnapshotRepository,
    @inject(FOLLOWING_REPOSITORY) private readonly followingRepo: FollowingRepository,
    @inject(POSITION_VIEW_PREFS_REPOSITORY) private readonly viewPrefsRepo: PositionViewPrefsRepository,
    @inject(GatewayPositionsRepository) private readonly positionsRepo: GatewayPositionsRepository,
    @inject(WALLETS_REPOSITORY) private readonly walletsRepo: WalletsRepository,
  ) {
    super();
  }

  async revalidateWith(positions: readonly TGatewayPosition[], tokens: TTokensMap): Promise<void> {
    if (this.inflight) return this.inflight;
    this.inflight = this.doRevalidate(positions, tokens).finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }

  async revalidate(): Promise<void> {
    const wallets = this.walletsRepo.getAll().map((w) => ({
      address: w.address,
      chainIds: [...w.chainIds],
    }));
    if (wallets.length === 0) {
      await this.revalidateWith([], {});
      return;
    }
    try {
      const data = await this.positionsRepo.list({ wallets });
      await this.revalidateWith(data.data, data.tokens);
    } catch (error) {
      this.logger.warn("Widget snapshot revalidation failed", { error });
    }
  }

  private async doRevalidate(positions: readonly TGatewayPosition[], tokens: TTokensMap): Promise<void> {
    const snapshot = buildWidgetSnapshot({
      positions,
      following: new Set(this.followingRepo.getAll()),
      invertedRefs: new Set(this.viewPrefsRepo.getInvertedRefs()),
      tokens,
      now: Date.now(),
    });
    await this.repo.write(snapshot);
  }
}
