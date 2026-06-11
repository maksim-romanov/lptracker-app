import { UseCase } from "core/domain/base/usecase";
import { PositionViewPrefsStore } from "positions/presentation/stores/position-view-prefs.store";
import { inject, injectable } from "tsyringe";
import type { WidgetSnapshotService } from "widgets/application/widget-snapshot.service";
import { WIDGET_SNAPSHOT_SERVICE } from "widgets/di/tokens";

@injectable()
export class ToggleInvertedUseCase extends UseCase<boolean, string> {
  constructor(
    @inject(PositionViewPrefsStore) private readonly store: PositionViewPrefsStore,
    @inject(WIDGET_SNAPSHOT_SERVICE) private readonly widgetSnapshot: WidgetSnapshotService,
  ) {
    super();
  }

  async execute(ref: string): Promise<boolean> {
    const next = this.store.toggleInverted(ref);
    void this.widgetSnapshot.revalidate().catch((error) => {
      this.logger.warn("Widget revalidation after invert toggle failed", { error });
    });
    return next;
  }
}
