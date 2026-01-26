import { Address, BigInt } from "@graphprotocol/graph-ts";

import { Pool as PoolContract } from "../../generated/templates/Pool/Pool";
import { Tick } from "../../generated/schema";

export function getTickId(poolAddress: Address, tickIdx: i32): string {
  return poolAddress.toHexString() + "-" + tickIdx.toString();
}

export function getOrCreateTick(poolAddress: Address, tickIdx: i32, blockNumber: BigInt): Tick | null {
  let tickId = getTickId(poolAddress, tickIdx);
  let tick = Tick.load(tickId);

  if (tick == null) {
    let poolContract = PoolContract.bind(poolAddress);
    let tickResult = poolContract.try_ticks(tickIdx);

    if (tickResult.reverted) {
      return null;
    }

    tick = new Tick(tickId);
    tick.pool = poolAddress.toHexString();
    tick.tickIdx = tickIdx;
    tick.liquidityGross = tickResult.value.getLiquidityGross();
    tick.liquidityNet = tickResult.value.getLiquidityNet();
    tick.feeGrowthOutside0X128 = tickResult.value.getFeeGrowthOutside0X128();
    tick.feeGrowthOutside1X128 = tickResult.value.getFeeGrowthOutside1X128();
    tick.lastSyncedBlock = blockNumber;
    tick.save();
  }

  return tick;
}

export function updateTick(poolAddress: Address, tickIdx: i32, blockNumber: BigInt): Tick | null {
  let tickId = getTickId(poolAddress, tickIdx);
  let tick = Tick.load(tickId);

  let poolContract = PoolContract.bind(poolAddress);
  let tickResult = poolContract.try_ticks(tickIdx);

  if (tickResult.reverted) {
    return tick;
  }

  if (tick == null) {
    tick = new Tick(tickId);
    tick.pool = poolAddress.toHexString();
    tick.tickIdx = tickIdx;
  }

  tick.liquidityGross = tickResult.value.getLiquidityGross();
  tick.liquidityNet = tickResult.value.getLiquidityNet();
  tick.feeGrowthOutside0X128 = tickResult.value.getFeeGrowthOutside0X128();
  tick.feeGrowthOutside1X128 = tickResult.value.getFeeGrowthOutside1X128();
  tick.lastSyncedBlock = blockNumber;

  // If liquidityGross is zero, tick is uninitialized - don't save
  if (tick.liquidityGross.equals(BigInt.zero())) {
    return null;
  }

  tick.save();
  return tick;
}
