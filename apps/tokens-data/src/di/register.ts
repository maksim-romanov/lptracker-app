import { redis, type RedisClient } from "bun";
import { container } from "tsyringe";

import { REDIS } from "./tokens";
import * as logos from "../features/logos/di/register";
import * as prices from "../features/prices/di/register";

export function registerApp(): void {
  container.register<RedisClient>(REDIS, { useValue: redis });
  logos.register();
  prices.register();
}
