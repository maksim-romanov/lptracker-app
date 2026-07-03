import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

import { Position } from "../../generated/schema";

export function saltToTokenId(salt: Bytes): BigInt {
  let reversed = new Uint8Array(salt.length);
  for (let i = 0; i < salt.length; i++) {
    reversed[i] = salt[salt.length - 1 - i];
  }
  return BigInt.fromUnsignedBytes(Bytes.fromUint8Array(reversed));
}

export function updateClosed(position: Position, burned: boolean): void {
  position.closed = burned || position.liquidity.equals(BigInt.zero());
}

export function getOrCreatePosition(tokenId: BigInt, blockNumber: BigInt, timestamp: BigInt): Position {
  let id = tokenId.toString();
  let position = Position.load(id);
  if (position == null) {
    position = new Position(id);
    position.owner = Address.zero();
    position.pool = null;
    position.tickLower = 0;
    position.tickUpper = 0;
    position.liquidity = BigInt.zero();
    position.closed = false;
    position.createdAtBlock = blockNumber;
    position.createdAtTimestamp = timestamp;
    position.updatedAtBlock = blockNumber;
    position.updatedAtTimestamp = timestamp;
  }
  return position;
}
