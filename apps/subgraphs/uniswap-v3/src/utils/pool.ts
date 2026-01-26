import { Address, BigInt } from "@graphprotocol/graph-ts";

import { Factory } from "../../generated/NonfungiblePositionManager/Factory";
import { Pool as PoolContract } from "../../generated/NonfungiblePositionManager/Pool";
import { Pool } from "../../generated/schema";
import { Pool as PoolTemplate } from "../../generated/templates";

import { getOrCreateToken } from "./token";

const FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

export function getOrCreatePool(token0Address: Address, token1Address: Address, fee: i32, blockNumber: BigInt, timestamp: BigInt): Pool | null {
  let factory = Factory.bind(Address.fromString(FACTORY_ADDRESS));
  let poolAddressResult = factory.try_getPool(token0Address, token1Address, fee);

  if (poolAddressResult.reverted) {
    return null;
  }

  let poolAddress = poolAddressResult.value;
  if (poolAddress == Address.zero()) {
    return null;
  }

  let pool = Pool.load(poolAddress.toHexString());
  if (pool == null) {
    // Create tokens
    let token0 = getOrCreateToken(token0Address);
    let token1 = getOrCreateToken(token1Address);

    // Create pool
    pool = new Pool(poolAddress.toHexString());
    pool.token0 = token0.id;
    pool.token1 = token1.id;
    pool.feeTier = fee;

    // Fetch pool state
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

    pool.createdAtBlock = blockNumber;
    pool.createdAtTimestamp = timestamp;

    pool.save();

    // Start indexing pool events (for pools created before startBlock)
    PoolTemplate.create(poolAddress);
  }

  return pool;
}
