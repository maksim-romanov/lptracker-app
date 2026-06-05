import { errorMiddleware } from "core/api-client/middleware/error.middleware";
import { loggerMiddleware } from "core/api-client/middleware/logger.middleware";
import { config } from "core/config";
import { container } from "core/di/container";
import createClient from "openapi-fetch";

import type { paths as UniswapV3Paths } from "../data/generated/uniswap-v3";
import { UNISWAP_V3_API } from "./tokens";

const client = createClient<UniswapV3Paths>({ baseUrl: `${config.api.gateway.baseUrl}/api/uniswap-v3/v1` });
export type UniswapV3ApiClient = typeof client;

export function register() {
  client.use(errorMiddleware(), loggerMiddleware());
  container.register(UNISWAP_V3_API, { useValue: client });
}
