import { UseCase } from "core/domain/base/usecase";
import { inject, injectable } from "tsyringe";
import type { WalletsRepository } from "wallets/data/wallets.repository";
import { WALLETS_REPOSITORY } from "wallets/di/tokens";
import type { WidgetSnapshotService } from "widgets/application/widget-snapshot.service";
import { WIDGET_SNAPSHOT_SERVICE } from "widgets/di/tokens";

@injectable()
export class DeleteWalletUseCase extends UseCase<boolean, string> {
  constructor(
    @inject(WALLETS_REPOSITORY) private readonly repo: WalletsRepository,
    @inject(WIDGET_SNAPSHOT_SERVICE) private readonly widgetSnapshot: WidgetSnapshotService,
  ) {
    super();
  }

  async execute(id: string): Promise<boolean> {
    const confirmed = await this.alert.confirm("This wallet will be removed from your list.", {
      title: "Delete Wallet?",
      confirmText: "Delete",
      confirmStyle: "destructive",
    });

    if (!confirmed) return false;

    this.repo.delete(id);
    this.logger.debug("Wallet deleted", { id });
    void this.widgetSnapshot.revalidate().catch((error) => {
      this.logger.warn("Widget revalidation after wallet delete failed", { error });
    });
    return true;
  }
}
