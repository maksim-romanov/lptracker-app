import { container } from "core/di/container";

// Eager-import so TaskManager.defineTask runs at bundle eval (required for iOS BG wake).
import "../application/background-refresh.task";

import { WidgetSnapshotService } from "../application/widget-snapshot.service";
import { WidgetSnapshotRepository } from "../data/widget-snapshot.repository";
import { WIDGET_SNAPSHOT_REPOSITORY, WIDGET_SNAPSHOT_SERVICE } from "./tokens";

export function register() {
  container.register(WIDGET_SNAPSHOT_REPOSITORY, WidgetSnapshotRepository);
  container.registerSingleton(WIDGET_SNAPSHOT_SERVICE, WidgetSnapshotService);
}
