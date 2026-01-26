import { BigInt } from "@graphprotocol/graph-ts";

import { PoolCreated as PoolCreatedEvent } from "../generated/Factory/Factory";
import { Pool as PoolTemplate } from "../generated/templates";
import { Pool as PoolContract } from "../generated/templates/Pool/Pool";

import { Pool } from "../generated/schema";
import { getOrCreateToken } from "./utils/token";

export function handlePoolCreated(event: PoolCreatedEvent): void {
  let poolAddress = event.params.pool;
  let pool = Pool.load(poolAddress.toHexString());

  if (pool != null) {
    return;
  }

  // Create tokens using shared utility
  let token0 = getOrCreateToken(event.params.token0);
  let token1 = getOrCreateToken(event.params.token1);

  // Create pool
  pool = new Pool(poolAddress.toHexString());
  pool.token0 = token0.id;
  pool.token1 = token1.id;
  pool.feeTier = event.params.fee;

  // Fetch initial pool state
  let poolContract = PoolContract.bind(poolAddress);

  let slot0Result = poolContract.try_slot0();
  if (slot0Result.reverted) {
    pool.sqrtPriceX96 = BigInt.zero();
    pool.currentTick = 0;
  } else {
    pool.sqrtPriceX96 = slot0Result.value.getSqrtPriceX96();
    pool.currentTick = slot0Result.value.getTick();
  }

  let liquidityResult = poolContract.try_liquidity();
  if (liquidityResult.reverted) {
    pool.liquidity = BigInt.zero();
  } else {
    pool.liquidity = liquidityResult.value;
  }

  pool.createdAtBlock = event.block.number;
  pool.createdAtTimestamp = event.block.timestamp;

  pool.save();

  // Start indexing pool events
  PoolTemplate.create(poolAddress);
}
