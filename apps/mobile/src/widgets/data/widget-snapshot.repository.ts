import { Repository } from "core/domain/base/repository";
import { injectable } from "tsyringe";

import type { TWidgetSnapshot } from "../domain/types";
import { reload, writeSnapshot } from "../native/widget-bridge";

@injectable()
export class WidgetSnapshotRepository extends Repository {
  static readonly WIDGET_KIND = "depthly.position";

  async write(snapshot: TWidgetSnapshot): Promise<void> {
    try {
      await writeSnapshot(JSON.stringify(snapshot));
      await reload(WidgetSnapshotRepository.WIDGET_KIND);
    } catch (error) {
      this.logger.warn("WidgetSnapshotRepository: write failed", { error });
    }
  }
}
