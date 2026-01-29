import { container } from "core/di/container";
import createClient from "openapi-fetch";

import type { paths as GatewayPaths } from "../generated/gateway";
import { errorMiddleware } from "../middleware/error.middleware";
import { loggerMiddleware } from "../middleware/logger.middleware";
import { GATEWAY_API } from "./tokens";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const client = createClient<GatewayPaths>({ baseUrl: `${API_URL}/api/v1` });
export type GatewayApiClient = typeof client;

export function register(): void {
  client.use(errorMiddleware(), loggerMiddleware());
  container.register(GATEWAY_API, { useValue: client });
}
