import { newMockEvent } from "matchstick-as";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/PositionManager/PositionManager";

export function createTransferEvent(from: Address, to: Address, tokenId: BigInt): Transfer {
  let event = changetype<Transfer>(newMockEvent());
  event.parameters = [];
  event.parameters.push(new ethereum.EventParam("from", ethereum.Value.fromAddress(from)));
  event.parameters.push(new ethereum.EventParam("to", ethereum.Value.fromAddress(to)));
  event.parameters.push(new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(tokenId)));
  return event;
}
