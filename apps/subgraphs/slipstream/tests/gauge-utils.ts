import { newMockEvent } from "matchstick-as";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import { Deposit, Withdraw } from "../generated/templates/CLGauge/CLGauge";

export function createDepositEvent(gauge: Address, user: Address, tokenId: BigInt, liquidity: BigInt): Deposit {
  let depositEvent = changetype<Deposit>(newMockEvent());
  depositEvent.address = gauge;
  depositEvent.parameters = [];
  depositEvent.parameters.push(new ethereum.EventParam("user", ethereum.Value.fromAddress(user)));
  depositEvent.parameters.push(new ethereum.EventParam("tokenId", ethereum.Value.fromUnsignedBigInt(tokenId)));
  depositEvent.parameters.push(new ethereum.EventParam("liquidityToStake", ethereum.Value.fromUnsignedBigInt(liquidity)));
  return depositEvent;
}

export function createWithdrawEvent(gauge: Address, user: Address, tokenId: BigInt, liquidity: BigInt): Withdraw {
  let withdrawEvent = changetype<Withdraw>(newMockEvent());
  withdrawEvent.address = gauge;
  withdrawEvent.parameters = [];
  withdrawEvent.parameters.push(new ethereum.EventParam("user", ethereum.Value.fromAddress(user)));
  withdrawEvent.parameters.push(new ethereum.EventParam("tokenId", ethereum.Value.fromUnsignedBigInt(tokenId)));
  withdrawEvent.parameters.push(new ethereum.EventParam("liquidityToStake", ethereum.Value.fromUnsignedBigInt(liquidity)));
  return withdrawEvent;
}
