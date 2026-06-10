import { container } from "tsyringe";

// Eager-import so TaskManager.defineTask runs at bundle eval (required for iOS BG wake).
import "../application/background-refresh.task";

import { WidgetSnapshotRepository } from "../data/widget-snapshot.repository";
import { WidgetSnapshotService } from "../data/widget-snapshot.service";
import { WIDGET_SNAPSHOT_REPOSITORY, WIDGET_SNAPSHOT_SERVICE } from "./tokens";

export function registerWidgetsModule(): void {
  container.registerSingleton(WIDGET_SNAPSHOT_REPOSITORY, WidgetSnapshotRepository);
  container.registerSingleton(WIDGET_SNAPSHOT_SERVICE, WidgetSnapshotService);
}

export { WIDGET_SNAPSHOT_REPOSITORY, WIDGET_SNAPSHOT_SERVICE } from "./tokens";
