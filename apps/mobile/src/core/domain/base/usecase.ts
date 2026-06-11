import { container } from "core/di/container";
import { ALERTS, DEVICE_INFO, LOGGER } from "core/di/tokens";
import type { AlertsService, DeviceInfoService, Logger } from "core/services";

export abstract class UseCase<TOutput = void, TInput = void> {
  protected readonly logger = container.resolve<Logger>(LOGGER).extend(this.constructor.name);
  protected readonly alert = container.resolve<AlertsService>(ALERTS);
  protected readonly device = container.resolve<DeviceInfoService>(DEVICE_INFO);

  abstract execute(input: TInput): Promise<TOutput>;
}
