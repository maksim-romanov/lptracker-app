import { container } from "core/di/container";
import { APP_INFO, DEVICE_INFO, LOGGER } from "core/di/tokens";
import type { AppInfoService, DeviceInfoService, Logger } from "core/services";

export abstract class Service {
  protected readonly logger = container.resolve<Logger>(LOGGER).extend(this.constructor.name);
  protected readonly app = container.resolve<AppInfoService>(APP_INFO);
  protected readonly device = container.resolve<DeviceInfoService>(DEVICE_INFO);
}
