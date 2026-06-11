import { container } from "core/di/container";
import { LOGGER } from "core/di/tokens";
import { RootStore } from "core/presentation/root.store";
import type { Logger } from "core/services";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";

import { WIDGET_SNAPSHOT_SERVICE } from "../di/tokens";
import type { WidgetSnapshotService } from "./widget-snapshot.service";

const TASK_NAME = "depthly.widget.refresh";

const MINIMUM_INTERVAL_MINUTES = 30;

TaskManager.defineTask(TASK_NAME, async () => {
  const logger = container.resolve<Logger>(LOGGER).extend("widget-refresh-bg");
  try {
    logger.debug("BG refresh task fired");
    await container.resolve(RootStore).hydrate();
    const service = container.resolve<WidgetSnapshotService>(WIDGET_SNAPSHOT_SERVICE);
    await service.revalidate();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    logger.error("Widget BG refresh failed", { error });
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerWidgetBackgroundRefresh(): Promise<void> {
  const status = await BackgroundTask.getStatusAsync();
  if (status === BackgroundTask.BackgroundTaskStatus.Restricted) return;
  const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
  if (isRegistered) return;
  await BackgroundTask.registerTaskAsync(TASK_NAME, {
    minimumInterval: MINIMUM_INTERVAL_MINUTES,
  });
}
