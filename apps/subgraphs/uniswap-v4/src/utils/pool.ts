import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

import { Pool } from "../../generated/schema";

import { getOrCreateToken } from "./token";

// LPFeeLibrary.DYNAMIC_FEE_FLAG — PoolKey.fee equals this exact value for dynamic-fee pools.
let DYNAMIC_FEE_FLAG: i32 = 0x800000;

export function getOrCreatePool(
  id: Bytes,
  currency0: Address,
  currency1: Address,
  fee: i32,
  tickSpacing: i32,
  hooks: Address,
  sqrtPriceX96: BigInt,
  tick: i32,
  blockNumber: BigInt,
  timestamp: BigInt,
): Pool {
  let pool = Pool.load(id);
  if (pool == null) {
    let token0 = getOrCreateToken(currency0);
    let token1 = getOrCreateToken(currency1);

    pool = new Pool(id);
    pool.token0 = token0.id;
    pool.token1 = token1.id;
    pool.feeTier = fee;
    pool.isDynamicFee = fee == DYNAMIC_FEE_FLAG;
    pool.tickSpacing = tickSpacing;
    pool.hooks = Bytes.fromHexString(hooks.toHexString());
    pool.sqrtPriceX96 = sqrtPriceX96;
    pool.tick = tick;
    pool.liquidity = BigInt.zero();
    pool.createdAtBlock = blockNumber;
    pool.createdAtTimestamp = timestamp;
    pool.updatedAtBlock = blockNumber;
    pool.updatedAtTimestamp = timestamp;
    pool.save();
  }
  return pool;
}
