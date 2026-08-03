import { container } from "core/di/container";

import { WidgetSnapshotService } from "../application/widget-snapshot.service";
import { WidgetSnapshotRepository } from "../data/widget-snapshot.repository";
import { WIDGET_SNAPSHOT_REPOSITORY, WIDGET_SNAPSHOT_SERVICE } from "./tokens";

export function register() {
  container.register(WIDGET_SNAPSHOT_REPOSITORY, WidgetSnapshotRepository);
  container.registerSingleton(WIDGET_SNAPSHOT_SERVICE, WidgetSnapshotService);
}
