import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

import { Factory } from "../../generated/NonfungiblePositionManager/Factory";
import { Pool } from "../../generated/schema";

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

  let poolId = Bytes.fromHexString(poolAddress.toHexString());
  let pool = Pool.load(poolId);
  if (pool == null) {
    let token0 = getOrCreateToken(token0Address);
    let token1 = getOrCreateToken(token1Address);

    pool = new Pool(poolId);
    pool.token0 = token0.id;
    pool.token1 = token1.id;
    pool.feeTier = fee;
    pool.createdAtBlock = blockNumber;
    pool.createdAtTimestamp = timestamp;

    pool.save();
  }

  return pool;
}
