import { Address, BigInt } from "@graphprotocol/graph-ts";

import {
  Transfer,
  IncreaseLiquidity,
  DecreaseLiquidity,
  Collect,
  NonfungiblePositionManager,
} from "../generated/NonfungiblePositionManager/NonfungiblePositionManager";

import { Position } from "../generated/schema";
import { getOrCreatePool } from "./utils/pool";
import { updateTick } from "./utils/tick";

function syncPosition(contractAddress: Address, tokenId: BigInt, blockNumber: BigInt, timestamp: BigInt): void {
  let position = Position.load(tokenId.toString());
  if (position == null) return;

  let contract = NonfungiblePositionManager.bind(contractAddress);
  let result = contract.try_positions(tokenId);

  // If the call reverted (position was burned or doesn't exist), mark as closed
  if (result.reverted) {
    position.closed = true;
    position.updatedAtBlock = blockNumber;
    position.updatedAtTimestamp = timestamp;
    position.save();
    return;
  }

  let data = result.value;

  position.nonce = data.getNonce();
  position.operator = data.getOperator();
  position.tickLower = data.getTickLower();
  position.tickUpper = data.getTickUpper();
  position.liquidity = data.getLiquidity();
  position.updatedAtBlock = blockNumber;
  position.updatedAtTimestamp = timestamp;

  // Get or create pool if not set (using shared utility)
  if (position.pool == null) {
    let pool = getOrCreatePool(data.getToken0(), data.getToken1(), data.getFee(), blockNumber, timestamp);
    if (pool != null) {
      position.pool = pool.id;

      // Update tick entities and link to position (using shared utility)
      let poolAddress = Address.fromString(pool.id);
      let tickLower = updateTick(poolAddress, position.tickLower, blockNumber);
      let tickUpper = updateTick(poolAddress, position.tickUpper, blockNumber);

      if (tickLower != null) {
        position.tickLowerData = tickLower.id;
      }
      if (tickUpper != null) {
        position.tickUpperData = tickUpper.id;
      }
    }
  }

  if (position.liquidity == BigInt.zero()) {
    position.closed = true;
  }

  position.save();
}

export function handleTransfer(event: Transfer): void {
  let tokenId = event.params.tokenId.toString();
  let isNewPosition = false;

  let position = Position.load(tokenId);
  if (position == null) {
    isNewPosition = true;
    position = new Position(tokenId);
    position.liquidity = BigInt.zero();
    position.owner = event.params.to;
    position.operator = Address.zero();
    position.nonce = BigInt.zero();
    position.pool = null;
    position.tickLower = 0;
    position.tickUpper = 0;
    position.tickLowerData = null;
    position.tickUpperData = null;
    position.closed = false;
    position.createdAtBlock = event.block.number;
    position.createdAtTimestamp = event.block.timestamp;
    position.updatedAtBlock = event.block.number;
    position.updatedAtTimestamp = event.block.timestamp;

    // Fetch position data immediately to get pool
    let contract = NonfungiblePositionManager.bind(event.address);
    let result = contract.try_positions(event.params.tokenId);
    if (!result.reverted) {
      let data = result.value;
      position.nonce = data.getNonce();
      position.operator = data.getOperator();
      position.tickLower = data.getTickLower();
      position.tickUpper = data.getTickUpper();
      position.liquidity = data.getLiquidity();

      // Get or create pool (using shared utility)
      let pool = getOrCreatePool(data.getToken0(), data.getToken1(), data.getFee(), event.block.number, event.block.timestamp);
      if (pool != null) {
        position.pool = pool.id;

        // Update tick entities and link to position (using shared utility)
        let poolAddress = Address.fromString(pool.id);
        let tickLower = updateTick(poolAddress, position.tickLower, event.block.number);
        let tickUpper = updateTick(poolAddress, position.tickUpper, event.block.number);

        if (tickLower != null) {
          position.tickLowerData = tickLower.id;
        }
        if (tickUpper != null) {
          position.tickUpperData = tickUpper.id;
        }
      }
    }
  }

  // burn
  if (event.params.to == Address.zero()) {
    position.closed = true;
    position.updatedAtBlock = event.block.number;
    position.updatedAtTimestamp = event.block.timestamp;
    position.save();
    return;
  }

  position.owner = event.params.to;
  position.updatedAtBlock = event.block.number;
  position.updatedAtTimestamp = event.block.timestamp;
  position.save();

  // For existing positions, sync to get latest data
  if (!isNewPosition) {
    syncPosition(event.address, event.params.tokenId, event.block.number, event.block.timestamp);
  }
}

export function handleIncreaseLiquidity(event: IncreaseLiquidity): void {
  syncPosition(event.address, event.params.tokenId, event.block.number, event.block.timestamp);
}

export function handleDecreaseLiquidity(event: DecreaseLiquidity): void {
  syncPosition(event.address, event.params.tokenId, event.block.number, event.block.timestamp);
}

export function handleCollect(event: Collect): void {
  syncPosition(event.address, event.params.tokenId, event.block.number, event.block.timestamp);
}
