import { Initialize, ModifyLiquidity, Swap } from "../generated/PoolManager/PoolManager";
import { Pool } from "../generated/schema";

import { POSITION_MANAGER } from "./constants";
import { getOrCreatePool } from "./utils/pool";
import { getOrCreatePosition, saltToTokenId, updateClosed } from "./utils/position";

export function handleInitialize(event: Initialize): void {
  getOrCreatePool(
    event.params.id,
    event.params.currency0,
    event.params.currency1,
    event.params.fee,
    event.params.tickSpacing,
    event.params.hooks,
    event.params.sqrtPriceX96,
    event.params.tick,
    event.block.number,
    event.block.timestamp,
  );
}

export function handleModifyLiquidity(event: ModifyLiquidity): void {
  if (!event.params.sender.equals(POSITION_MANAGER)) {
    return;
  }

  let tokenId = saltToTokenId(event.params.salt);
  let position = getOrCreatePosition(tokenId, event.block.number, event.block.timestamp);

  if (position.pool === null) {
    position.pool = event.params.id;
  }

  position.tickLower = event.params.tickLower;
  position.tickUpper = event.params.tickUpper;
  position.liquidity = position.liquidity.plus(event.params.liquidityDelta);
  updateClosed(position, false);
  position.updatedAtBlock = event.block.number;
  position.updatedAtTimestamp = event.block.timestamp;
  position.save();
}

export function handleSwap(event: Swap): void {
  let pool = Pool.load(event.params.id);
  if (pool === null) {
    return;
  }

  pool.sqrtPriceX96 = event.params.sqrtPriceX96;
  pool.tick = event.params.tick;
  pool.liquidity = event.params.liquidity;
  pool.updatedAtBlock = event.block.number;
  pool.updatedAtTimestamp = event.block.timestamp;
  pool.save();
}
