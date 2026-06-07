import { type RedisClient, redis } from "bun";
import { container } from "tsyringe";

import * as logos from "../features/logos/di/register";
import * as meta from "../features/meta/di/register";
import * as prices from "../features/prices/di/register";
import * as stables from "../features/stables/di/register";
import { REDIS } from "./tokens";

export function registerApp(): void {
  container.register<RedisClient>(REDIS, { useValue: redis });
  logos.register();
  prices.register();
  meta.register();
  stables.register();
}
