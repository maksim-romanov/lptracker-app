import { redis } from "bun";
import { container } from "tsyringe";

import * as tokenPrices from "../features/token-prices/di/register";
import * as tokensMeta from "../features/tokens-meta/di/register";
import * as uniswapV3 from "../features/uniswap-v3/di/register";
import { REDIS } from "./tokens";

export function registerApp() {
  container.register(REDIS, { useValue: redis });

  tokensMeta.register();
  tokenPrices.register();
  uniswapV3.register();
}
