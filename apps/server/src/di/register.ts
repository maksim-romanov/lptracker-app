import * as shared from "../shared/di/register";
import * as uniswapV3 from "../features/uniswap-v3/di/register";

export function registerApp() {
  shared.register();
  uniswapV3.register();
}
