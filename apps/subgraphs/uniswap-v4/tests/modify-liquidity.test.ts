import { assert, describe, test, clearStore, beforeEach } from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { handleModifyLiquidity } from "../src/pool-manager";
import { saltToTokenId } from "../src/utils/position";
import { createModifyLiquidityEvent, tokenIdToSalt } from "./pool-manager-utils";

const POOL_ID = Bytes.fromHexString("0x1111111111111111111111111111111111111111111111111111111111111111");
const POSITION_MANAGER = Address.fromString("0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e");
const RANDOM_SENDER = Address.fromString("0x9999999999999999999999999999999999999999");

describe("saltToTokenId", () => {
  test("round-trips bytes32(tokenId) back to the tokenId", () => {
    assert.stringEquals(saltToTokenId(tokenIdToSalt(1)).toString(), "1");
    assert.stringEquals(saltToTokenId(tokenIdToSalt(123456)).toString(), "123456");
  });
});

describe("handleModifyLiquidity", () => {
  beforeEach(() => {
    clearStore();
  });

  test("mint: creates position, links pool, sets ticks and liquidity", () => {
    let event = createModifyLiquidityEvent(POOL_ID, POSITION_MANAGER, -120, 120, BigInt.fromI32(1000000), tokenIdToSalt(1));
    handleModifyLiquidity(event);

    assert.entityCount("Position", 1);
    assert.fieldEquals("Position", "1", "liquidity", "1000000");
    assert.fieldEquals("Position", "1", "tickLower", "-120");
    assert.fieldEquals("Position", "1", "tickUpper", "120");
    assert.fieldEquals("Position", "1", "pool", POOL_ID.toHexString());
    assert.fieldEquals("Position", "1", "closed", "false");
  });

  test("increase then full decrease: accumulates and auto-closes at zero", () => {
    handleModifyLiquidity(createModifyLiquidityEvent(POOL_ID, POSITION_MANAGER, -120, 120, BigInt.fromI32(1000000), tokenIdToSalt(2)));
    handleModifyLiquidity(createModifyLiquidityEvent(POOL_ID, POSITION_MANAGER, -120, 120, BigInt.fromI32(500000), tokenIdToSalt(2)));
    assert.fieldEquals("Position", "2", "liquidity", "1500000");
    assert.fieldEquals("Position", "2", "closed", "false");

    handleModifyLiquidity(createModifyLiquidityEvent(POOL_ID, POSITION_MANAGER, -120, 120, BigInt.fromI32(-1500000), tokenIdToSalt(2)));
    assert.fieldEquals("Position", "2", "liquidity", "0");
    assert.fieldEquals("Position", "2", "closed", "true");
  });

  test("ignores ModifyLiquidity whose sender is not the PositionManager", () => {
    let event = createModifyLiquidityEvent(POOL_ID, RANDOM_SENDER, -120, 120, BigInt.fromI32(1000000), tokenIdToSalt(3));
    handleModifyLiquidity(event);
    assert.entityCount("Position", 0);
  });
});
