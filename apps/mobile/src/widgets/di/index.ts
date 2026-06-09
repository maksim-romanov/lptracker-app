import { container } from "tsyringe";

import { WidgetSnapshotRepository } from "../data/widget-snapshot.repository";
import { WidgetSnapshotStore } from "../presentation/widget-snapshot.store";
import { WIDGET_SNAPSHOT_REPOSITORY, WIDGET_SNAPSHOT_STORE } from "./tokens";

export function registerWidgetsModule(): void {
  container.register(WIDGET_SNAPSHOT_REPOSITORY, { useClass: WidgetSnapshotRepository });
  container.register(WIDGET_SNAPSHOT_STORE, { useClass: WidgetSnapshotStore });
}

export { WIDGET_SNAPSHOT_REPOSITORY, WIDGET_SNAPSHOT_STORE } from "./tokens";
