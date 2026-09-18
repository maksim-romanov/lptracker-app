import { newMockEvent } from "matchstick-as";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import { Collect, DecreaseLiquidity, IncreaseLiquidity, Transfer } from "../generated/NonfungiblePositionManager/NonfungiblePositionManager";

export function createCollectEvent(tokenId: BigInt, recipient: Address, amount0: BigInt, amount1: BigInt): Collect {
  let collectEvent = changetype<Collect>(newMockEvent());

  collectEvent.parameters = [];

  collectEvent.parameters.push(new ethereum.EventParam("tokenId", ethereum.Value.fromUnsignedBigInt(tokenId)));
  collectEvent.parameters.push(new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient)));
  collectEvent.parameters.push(new ethereum.EventParam("amount0", ethereum.Value.fromUnsignedBigInt(amount0)));
  collectEvent.parameters.push(new ethereum.EventParam("amount1", ethereum.Value.fromUnsignedBigInt(amount1)));

  return collectEvent;
}

export function createDecreaseLiquidityEvent(tokenId: BigInt, liquidity: BigInt, amount0: BigInt, amount1: BigInt): DecreaseLiquidity {
  let decreaseLiquidityEvent = changetype<DecreaseLiquidity>(newMockEvent());

  decreaseLiquidityEvent.parameters = [];

  decreaseLiquidityEvent.parameters.push(new ethereum.EventParam("tokenId", ethereum.Value.fromUnsignedBigInt(tokenId)));
  decreaseLiquidityEvent.parameters.push(new ethereum.EventParam("liquidity", ethereum.Value.fromUnsignedBigInt(liquidity)));
  decreaseLiquidityEvent.parameters.push(new ethereum.EventParam("amount0", ethereum.Value.fromUnsignedBigInt(amount0)));
  decreaseLiquidityEvent.parameters.push(new ethereum.EventParam("amount1", ethereum.Value.fromUnsignedBigInt(amount1)));

  return decreaseLiquidityEvent;
}

export function createIncreaseLiquidityEvent(tokenId: BigInt, liquidity: BigInt, amount0: BigInt, amount1: BigInt): IncreaseLiquidity {
  let increaseLiquidityEvent = changetype<IncreaseLiquidity>(newMockEvent());

  increaseLiquidityEvent.parameters = [];

  increaseLiquidityEvent.parameters.push(new ethereum.EventParam("tokenId", ethereum.Value.fromUnsignedBigInt(tokenId)));
  increaseLiquidityEvent.parameters.push(new ethereum.EventParam("liquidity", ethereum.Value.fromUnsignedBigInt(liquidity)));
  increaseLiquidityEvent.parameters.push(new ethereum.EventParam("amount0", ethereum.Value.fromUnsignedBigInt(amount0)));
  increaseLiquidityEvent.parameters.push(new ethereum.EventParam("amount1", ethereum.Value.fromUnsignedBigInt(amount1)));

  return increaseLiquidityEvent;
}

export function createTransferEvent(from: Address, to: Address, tokenId: BigInt): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent());

  transferEvent.parameters = [];

  transferEvent.parameters.push(new ethereum.EventParam("from", ethereum.Value.fromAddress(from)));
  transferEvent.parameters.push(new ethereum.EventParam("to", ethereum.Value.fromAddress(to)));
  transferEvent.parameters.push(new ethereum.EventParam("tokenId", ethereum.Value.fromUnsignedBigInt(tokenId)));

  return transferEvent;
}
