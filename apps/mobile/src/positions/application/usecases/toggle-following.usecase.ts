import { UseCase } from "core/domain/base/usecase";
import { FollowingStore } from "positions/presentation/stores/following.store";
import { inject, injectable } from "tsyringe";
import type { WidgetSnapshotService } from "widgets/application/widget-snapshot.service";
import { WIDGET_SNAPSHOT_SERVICE } from "widgets/di/tokens";

type TInput = { ref: string; next: boolean };

@injectable()
export class ToggleFollowingUseCase extends UseCase<void, TInput> {
  constructor(
    @inject(FollowingStore) private readonly store: FollowingStore,
    @inject(WIDGET_SNAPSHOT_SERVICE) private readonly widgetSnapshot: WidgetSnapshotService,
  ) {
    super();
  }

  async execute({ ref, next }: TInput): Promise<void> {
    if (next) this.store.follow(ref);
    else this.store.unfollow(ref);
    void this.widgetSnapshot.revalidate().catch((error) => {
      this.logger.warn("Widget revalidation after follow toggle failed", { error });
    });
  }
}
