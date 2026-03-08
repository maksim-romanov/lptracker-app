import * as apiClient from "core/api-client/di/register";
import * as linking from "core/linking/di/register";
import * as query from "core/query/di/register";
import { AppInfoService, DeviceInfoService, ReactNativeAlerts, ReactNativeLogger } from "core/services";
import * as uniswapV3 from "features/uniswap-v3/di/register";
import * as positions from "positions/di/register";
import * as wallets from "wallets/di/register";

import { container } from "./container";
import { ALERTS, APP_INFO, DEVICE_INFO, LOGGER } from "./tokens";

function register() {
  // Core
  container.register(LOGGER, { useValue: ReactNativeLogger });
  container.register(ALERTS, { useValue: ReactNativeAlerts });
  container.registerSingleton(APP_INFO, AppInfoService);
  container.registerSingleton(DEVICE_INFO, DeviceInfoService);
  apiClient.register();
  linking.register();
  query.register();

  // Entities
  positions.register();
  wallets.register();

  // Features
  uniswapV3.register();
}

// Auto-register on import
register();
