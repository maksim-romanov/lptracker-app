import { BigInt } from "@graphprotocol/graph-ts";

import { Swap as SwapEvent, Mint as MintEvent, Burn as BurnEvent } from "../generated/templates/Pool/Pool";

import { Pool } from "../generated/schema";
import { updateTick } from "./utils/tick";

export function handleSwap(event: SwapEvent): void {
  let pool = Pool.load(event.address.toHexString());
  if (pool == null) {
    return;
  }

  pool.sqrtPriceX96 = event.params.sqrtPriceX96;
  pool.currentTick = event.params.tick;
  pool.liquidity = event.params.liquidity;
  pool.save();
}

export function handleMint(event: MintEvent): void {
  let pool = Pool.load(event.address.toHexString());
  if (pool == null) {
    return;
  }

  pool.liquidity = pool.liquidity.plus(event.params.amount);
  pool.save();

  // Update ticks using shared utility
  updateTick(event.address, event.params.tickLower, event.block.number);
  updateTick(event.address, event.params.tickUpper, event.block.number);
}

export function handleBurn(event: BurnEvent): void {
  let pool = Pool.load(event.address.toHexString());
  if (pool == null) {
    return;
  }

  pool.liquidity = pool.liquidity.minus(event.params.amount);
  pool.save();

  // Update ticks using shared utility
  updateTick(event.address, event.params.tickLower, event.block.number);
  updateTick(event.address, event.params.tickUpper, event.block.number);
}
