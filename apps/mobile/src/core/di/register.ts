import {
  AppInfoService,
  DeviceInfoService,
  ReactNativeAlerts,
  ReactNativeLogger,
} from "core/services";

import { container } from "./container";
import { ALERTS, APP_INFO, DEVICE_INFO, LOGGER } from "./tokens";

/**
 * Register all core dependencies
 */
function registerCoreDependencies(): void {
  container.register(LOGGER, { useValue: ReactNativeLogger });
  container.register(ALERTS, { useValue: ReactNativeAlerts });
  container.registerSingleton(APP_INFO, AppInfoService);
  container.registerSingleton(DEVICE_INFO, DeviceInfoService);
}

/**
 * Bootstrap the DI container with all dependencies
 */
function bootstrap(): void {
  registerCoreDependencies();

  // Feature modules will register themselves here
  // registerPositionsModule();
  // registerWalletsModule();
}

// Auto-bootstrap on import
bootstrap();

export { container };
