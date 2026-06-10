import { Service } from "core/domain/base/service";
import { type IReactionDisposer, reaction } from "mobx";
import { GatewayPositionsRepository } from "positions/data/gateway-positions.repository";
import type { TGatewayPosition, TTokensMap } from "positions/domain/types";
import { FollowingStore } from "positions/presentation/stores/following.store";
import { PositionViewPrefsStore } from "positions/presentation/stores/position-view-prefs.store";
import { inject, injectable, singleton } from "tsyringe";
import { WalletsStore } from "wallets/presentation/wallets.store";

import { buildWidgetSnapshot } from "./widget-snapshot.builder";
import type { WidgetSnapshotRepository } from "./widget-snapshot.repository";
import { WIDGET_SNAPSHOT_REPOSITORY } from "../di/tokens";

/**
 * Widget snapshot orchestrator. Owns the end-to-end refresh pipeline:
 * watches WalletsStore → pulls fresh positions → prunes stale followings
 * and inverted refs → builds and writes the snapshot to the App Group.
 *
 * Intentionally crosses module boundaries (wallets, positions, widgets)
 * because the widget snapshot IS the integration point between them.
 * Consumers (UI hook, BG task) call into one place; per-module isolation
 * doesn't make sense for an orchestrator.
 */
@injectable()
@singleton()
export class WidgetSnapshotService extends Service {
  private walletsReaction: IReactionDisposer | null = null;
  private inflight: Promise<void> | null = null;

  constructor(
    @inject(WIDGET_SNAPSHOT_REPOSITORY) private readonly repo: WidgetSnapshotRepository,
    @inject(FollowingStore) private readonly following: FollowingStore,
    @inject(PositionViewPrefsStore) private readonly viewPrefs: PositionViewPrefsStore,
    @inject(GatewayPositionsRepository) private readonly positionsRepo: GatewayPositionsRepository,
    @inject(WalletsStore) private readonly walletsStore: WalletsStore,
  ) {
    super();
  }

  initialize(): void {
    if (this.walletsReaction) return;
    this.walletsReaction = reaction(
      () => this.walletsFingerprint(),
      () => {
        void this.refreshFromCurrentWallets();
      },
      { delay: 250 },
    );
  }

  async refresh(positions: readonly TGatewayPosition[], tokens: TTokensMap): Promise<void> {
    if (this.inflight) return this.inflight;
    this.inflight = this.doRefresh(positions, tokens).finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }

  async refreshFromCurrentWallets(): Promise<void> {
    const wallets = this.walletsStore.wallets.map((w) => ({
      address: w.address,
      chainIds: [...w.chainIds],
    }));
    if (wallets.length === 0) {
      await this.refresh([], {});
      return;
    }
    try {
      const data = await this.positionsRepo.list({ wallets });
      await this.refresh(data.data, data.tokens);
    } catch (error) {
      this.logger.warn("Widget refresh from current wallets failed", { error });
    }
  }

  private async doRefresh(positions: readonly TGatewayPosition[], tokens: TTokensMap): Promise<void> {
    const validRefs = new Set(positions.map((p) => p.ref));
    this.following.prune(validRefs);
    this.viewPrefs.pruneInverted(validRefs);
    const snapshot = buildWidgetSnapshot({
      positions,
      following: new Set(this.following.refs),
      invertedRefs: new Set(this.viewPrefs.invertedRefs),
      tokens,
      now: Date.now(),
    });
    await this.repo.write(snapshot);
  }

  // Deterministic key for the wallets reaction — sort wallet entries and
  // their chainIds so order changes don't fire spurious refreshes.
  private walletsFingerprint(): string {
    return this.walletsStore.wallets
      .map((w) => `${w.id}:${w.address}:${[...w.chainIds].sort().join(",")}`)
      .sort()
      .join("|");
  }
}
