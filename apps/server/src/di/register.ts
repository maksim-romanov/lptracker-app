import * as tokensMeta from "../features/tokens-meta/di/register";
import * as uniswapV3 from "../features/uniswap-v3/di/register";

export function registerApp() {
  tokensMeta.register();
  uniswapV3.register();
}
