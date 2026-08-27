import { redis } from "bun";
import { container } from "tsyringe";

import { REDIS } from "./tokens";
import * as tokenPrices from "#features/token-prices/di/register";
import * as uniswapV3 from "#features/uniswap-v3/di/register";

export function registerApp() {
  container.register(REDIS, { useValue: redis });

  tokenPrices.register();
  uniswapV3.register();
}
