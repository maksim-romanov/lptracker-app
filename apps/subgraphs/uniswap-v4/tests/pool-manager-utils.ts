import { newMockEvent, createMockedFunction } from "matchstick-as";
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Initialize, ModifyLiquidity, Swap } from "../generated/PoolManager/PoolManager";

export function createInitializeEvent(
  id: Bytes,
  currency0: Address,
  currency1: Address,
  fee: i32,
  tickSpacing: i32,
  hooks: Address,
  sqrtPriceX96: BigInt,
  tick: i32,
): Initialize {
  let event = changetype<Initialize>(newMockEvent());
  event.parameters = [];
  event.parameters.push(new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id)));
  event.parameters.push(new ethereum.EventParam("currency0", ethereum.Value.fromAddress(currency0)));
  event.parameters.push(new ethereum.EventParam("currency1", ethereum.Value.fromAddress(currency1)));
  event.parameters.push(new ethereum.EventParam("fee", ethereum.Value.fromI32(fee)));
  event.parameters.push(new ethereum.EventParam("tickSpacing", ethereum.Value.fromI32(tickSpacing)));
  event.parameters.push(new ethereum.EventParam("hooks", ethereum.Value.fromAddress(hooks)));
  event.parameters.push(new ethereum.EventParam("sqrtPriceX96", ethereum.Value.fromUnsignedBigInt(sqrtPriceX96)));
  event.parameters.push(new ethereum.EventParam("tick", ethereum.Value.fromI32(tick)));
  return event;
}

export function createModifyLiquidityEvent(
  id: Bytes,
  sender: Address,
  tickLower: i32,
  tickUpper: i32,
  liquidityDelta: BigInt,
  salt: Bytes,
): ModifyLiquidity {
  let event = changetype<ModifyLiquidity>(newMockEvent());
  event.parameters = [];
  event.parameters.push(new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));
  event.parameters.push(new ethereum.EventParam("tickLower", ethereum.Value.fromI32(tickLower)));
  event.parameters.push(new ethereum.EventParam("tickUpper", ethereum.Value.fromI32(tickUpper)));
  event.parameters.push(new ethereum.EventParam("liquidityDelta", ethereum.Value.fromSignedBigInt(liquidityDelta)));
  event.parameters.push(new ethereum.EventParam("salt", ethereum.Value.fromFixedBytes(salt)));
  return event;
}

export function createSwapEvent(
  id: Bytes,
  sender: Address,
  amount0: BigInt,
  amount1: BigInt,
  sqrtPriceX96: BigInt,
  liquidity: BigInt,
  tick: i32,
  fee: i32,
): Swap {
  let event = changetype<Swap>(newMockEvent());
  event.parameters = [];
  event.parameters.push(new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));
  event.parameters.push(new ethereum.EventParam("amount0", ethereum.Value.fromSignedBigInt(amount0)));
  event.parameters.push(new ethereum.EventParam("amount1", ethereum.Value.fromSignedBigInt(amount1)));
  event.parameters.push(new ethereum.EventParam("sqrtPriceX96", ethereum.Value.fromUnsignedBigInt(sqrtPriceX96)));
  event.parameters.push(new ethereum.EventParam("liquidity", ethereum.Value.fromUnsignedBigInt(liquidity)));
  event.parameters.push(new ethereum.EventParam("tick", ethereum.Value.fromI32(tick)));
  event.parameters.push(new ethereum.EventParam("fee", ethereum.Value.fromI32(fee)));
  return event;
}

export function tokenIdToSalt(tokenId: i32): Bytes {
  let hex = tokenId.toString(16);
  while (hex.length < 64) {
    hex = "0" + hex;
  }
  return Bytes.fromHexString("0x" + hex);
}

export function mockERC20Token(tokenAddress: Address, symbol: string, name: string, decimals: i32): void {
  createMockedFunction(tokenAddress, "symbol", "symbol():(string)").returns([ethereum.Value.fromString(symbol)]);
  createMockedFunction(tokenAddress, "name", "name():(string)").returns([ethereum.Value.fromString(name)]);
  createMockedFunction(tokenAddress, "decimals", "decimals():(uint8)").returns([ethereum.Value.fromI32(decimals)]);
}

// Right-pad a short ASCII label to 32 bytes — how legacy tokens (MKR, DGD) store bytes32 symbol/name.
export function padToBytes32(text: string): Bytes {
  let hex = "";
  for (let i = 0; i < text.length; i++) {
    let code = text.charCodeAt(i);
    let h = code.toString(16);
    if (h.length < 2) {
      h = "0" + h;
    }
    hex += h;
  }
  while (hex.length < 64) {
    hex += "0";
  }
  return Bytes.fromHexString("0x" + hex);
}

// A token whose string symbol()/name() revert and only the bytes32 variants return.
export function mockERC20TokenBytes32(tokenAddress: Address, symbol: Bytes, name: Bytes, decimals: i32): void {
  createMockedFunction(tokenAddress, "symbol", "symbol():(string)").reverts();
  createMockedFunction(tokenAddress, "name", "name():(string)").reverts();
  createMockedFunction(tokenAddress, "symbol", "symbol():(bytes32)").returns([ethereum.Value.fromFixedBytes(symbol)]);
  createMockedFunction(tokenAddress, "name", "name():(bytes32)").returns([ethereum.Value.fromFixedBytes(name)]);
  createMockedFunction(tokenAddress, "decimals", "decimals():(uint8)").returns([ethereum.Value.fromI32(decimals)]);
}
