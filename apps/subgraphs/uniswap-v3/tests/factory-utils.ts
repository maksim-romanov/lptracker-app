import { newMockEvent } from "matchstick-as";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import { PoolCreated } from "../generated/Factory/Factory";

export function createPoolCreatedEvent(token0: Address, token1: Address, fee: i32, tickSpacing: i32, pool: Address): PoolCreated {
  let event = changetype<PoolCreated>(newMockEvent());

  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("token0", ethereum.Value.fromAddress(token0)));
  event.parameters.push(new ethereum.EventParam("token1", ethereum.Value.fromAddress(token1)));
  event.parameters.push(new ethereum.EventParam("fee", ethereum.Value.fromI32(fee)));
  event.parameters.push(new ethereum.EventParam("tickSpacing", ethereum.Value.fromI32(tickSpacing)));
  event.parameters.push(new ethereum.EventParam("pool", ethereum.Value.fromAddress(pool)));

  return event;
}
