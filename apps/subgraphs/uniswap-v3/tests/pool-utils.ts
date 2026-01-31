import { newMockEvent } from "matchstick-as";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import { Swap, Mint, Burn } from "../generated/templates/Pool/Pool";

export function createSwapEvent(
  sender: Address,
  recipient: Address,
  amount0: BigInt,
  amount1: BigInt,
  sqrtPriceX96: BigInt,
  liquidity: BigInt,
  tick: i32,
): Swap {
  let event = changetype<Swap>(newMockEvent());

  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));
  event.parameters.push(new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient)));
  event.parameters.push(new ethereum.EventParam("amount0", ethereum.Value.fromSignedBigInt(amount0)));
  event.parameters.push(new ethereum.EventParam("amount1", ethereum.Value.fromSignedBigInt(amount1)));
  event.parameters.push(new ethereum.EventParam("sqrtPriceX96", ethereum.Value.fromUnsignedBigInt(sqrtPriceX96)));
  event.parameters.push(new ethereum.EventParam("liquidity", ethereum.Value.fromUnsignedBigInt(liquidity)));
  event.parameters.push(new ethereum.EventParam("tick", ethereum.Value.fromI32(tick)));

  return event;
}

export function createMintEvent(
  sender: Address,
  owner: Address,
  tickLower: i32,
  tickUpper: i32,
  amount: BigInt,
  amount0: BigInt,
  amount1: BigInt,
): Mint {
  let event = changetype<Mint>(newMockEvent());

  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));
  event.parameters.push(new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner)));
  event.parameters.push(new ethereum.EventParam("tickLower", ethereum.Value.fromI32(tickLower)));
  event.parameters.push(new ethereum.EventParam("tickUpper", ethereum.Value.fromI32(tickUpper)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));
  event.parameters.push(new ethereum.EventParam("amount0", ethereum.Value.fromUnsignedBigInt(amount0)));
  event.parameters.push(new ethereum.EventParam("amount1", ethereum.Value.fromUnsignedBigInt(amount1)));

  return event;
}

export function createBurnEvent(owner: Address, tickLower: i32, tickUpper: i32, amount: BigInt, amount0: BigInt, amount1: BigInt): Burn {
  let event = changetype<Burn>(newMockEvent());

  event.parameters = [];

  event.parameters.push(new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner)));
  event.parameters.push(new ethereum.EventParam("tickLower", ethereum.Value.fromI32(tickLower)));
  event.parameters.push(new ethereum.EventParam("tickUpper", ethereum.Value.fromI32(tickUpper)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));
  event.parameters.push(new ethereum.EventParam("amount0", ethereum.Value.fromUnsignedBigInt(amount0)));
  event.parameters.push(new ethereum.EventParam("amount1", ethereum.Value.fromUnsignedBigInt(amount1)));

  return event;
}
