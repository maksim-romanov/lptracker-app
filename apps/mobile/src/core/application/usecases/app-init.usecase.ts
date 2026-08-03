import { CHAIN_LOGOS } from "core/config/chain-logos";
import { UseCase } from "core/domain/base";
import { RootStore } from "core/presentation/root.store";
import { Asset } from "expo-asset";
import { inject, injectable } from "tsyringe";
import { registerWidgetBackgroundRefresh } from "widgets/application/background-refresh.task";
import type { WidgetSnapshotService } from "widgets/application/widget-snapshot.service";
import { WIDGET_SNAPSHOT_SERVICE } from "widgets/di/tokens";

import { AppEvents } from "../events/app.events";

@injectable()
export class AppInitUseCase extends UseCase {
  private initialized = false;

  constructor(
    @inject(AppEvents) private readonly appEvents: AppEvents,
    @inject(RootStore) private readonly rootStore: RootStore,
    @inject(WIDGET_SNAPSHOT_SERVICE) private readonly widgetSnapshot: WidgetSnapshotService,
  ) {
    super();
  }

  async execute(): Promise<void> {
    if (this.initialized) {
      this.logger.debug("Already initialized, skipping");
      return;
    }

    this.appEvents.emit({ type: "APP_INITIALIZING" });

    try {
      await Promise.all([this.rootStore.hydrate(), Asset.loadAsync(Object.values(CHAIN_LOGOS))]);

      this.initialized = true;

      void this.widgetSnapshot.revalidate().catch((error) => {
        this.logger.warn("Widget startup revalidation failed", { error });
      });

      void registerWidgetBackgroundRefresh().catch((error) => {
        this.logger.warn("Widget background refresh registration failed", { error });
      });

      this.appEvents.emit({ type: "APP_INITIALIZED" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.appEvents.emit({ type: "APP_ERROR", error: message });
      this.logger.critical("App initialization failed", { error: message });
      this.alert.error("Failed to initialize app");
    }
  }
}
