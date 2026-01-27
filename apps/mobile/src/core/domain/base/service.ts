import { container } from "core/di/container";
import { APP_INFO, DEVICE_INFO, LOGGER } from "core/di/tokens";
import type { AppInfoService, DeviceInfoService, Logger } from "core/services";

/**
 * Base Service class for domain services
 *
 * Uses container.resolve() for common dependencies to simplify
 * child class constructors.
 *
 * @example
 * @injectable()
 * class AnalyticsService extends Service {
 *   track(event: string, properties?: Record<string, unknown>): void {
 *     this.logger.debug("Tracking event", { event, properties });
 *     // Include device info in analytics
 *     const platform = this.device.platform;
 *     // ...
 *   }
 * }
 */
export abstract class Service {
  protected readonly logger: Logger;
  protected readonly app: AppInfoService;
  protected readonly device: DeviceInfoService;

  constructor() {
    const baseLogger = container.resolve<Logger>(LOGGER);
    this.logger = baseLogger.extend(this.constructor.name);
    this.app = container.resolve<AppInfoService>(APP_INFO);
    this.device = container.resolve<DeviceInfoService>(DEVICE_INFO);
  }
}
