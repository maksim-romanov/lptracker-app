import { Address } from "@graphprotocol/graph-ts";

import { Transfer } from "../generated/PositionManager/PositionManager";

import { getOrCreatePosition, updateClosed } from "./utils/position";

export function handleTransfer(event: Transfer): void {
  let position = getOrCreatePosition(event.params.id, event.block.number, event.block.timestamp);

  if (event.params.to.equals(Address.zero())) {
    updateClosed(position, true);
  } else {
    position.owner = event.params.to;
  }

  position.updatedAtBlock = event.block.number;
  position.updatedAtTimestamp = event.block.timestamp;
  position.save();
}
