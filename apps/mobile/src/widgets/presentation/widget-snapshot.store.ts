import { Store } from "core/domain/base/store";
import { action, makeObservable } from "mobx";
import type { TGatewayPosition, TTokensMap } from "positions/domain/types";
import { FollowingStore } from "positions/presentation/stores/following.store";
import { PositionViewPrefsStore } from "positions/presentation/stores/position-view-prefs.store";
import { inject, singleton } from "tsyringe";

import { buildWidgetSnapshot } from "../data/widget-snapshot.builder";
import type { WidgetSnapshotRepository } from "../data/widget-snapshot.repository";
import { WIDGET_SNAPSHOT_REPOSITORY } from "../di/tokens";

@singleton()
export class WidgetSnapshotStore extends Store {
  constructor(
    @inject(WIDGET_SNAPSHOT_REPOSITORY) private readonly repo: WidgetSnapshotRepository,
    @inject(FollowingStore) private readonly following: FollowingStore,
    @inject(PositionViewPrefsStore) private readonly viewPrefs: PositionViewPrefsStore,
  ) {
    super();
    makeObservable(this);
  }

  hydrate(): void {}

  @action
  async refresh(positions: readonly TGatewayPosition[], tokens: TTokensMap): Promise<void> {
    const snapshot = buildWidgetSnapshot({
      positions,
      following: new Set(this.following.refs),
      invertedRefs: new Set(this.viewPrefs.invertedRefs),
      tokens,
      now: Date.now(),
    });
    await this.repo.write(snapshot);
  }
}
