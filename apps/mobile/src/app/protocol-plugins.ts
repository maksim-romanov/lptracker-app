import { uniswapV3Plugin } from "features/uniswap-v3";
import type { IProtocolPlugin } from "positions/domain/plugin.contract";
import type { TKnownExtensionType } from "positions/domain/types";

export const PROTOCOL_PLUGINS = {
  "uniswap-v3": uniswapV3Plugin,
} as const satisfies { [T in TKnownExtensionType]: IProtocolPlugin<T> };
