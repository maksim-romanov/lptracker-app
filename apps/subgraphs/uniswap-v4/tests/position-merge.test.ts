import { assert, describe, test, clearStore, beforeEach } from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { handleModifyLiquidity } from "../src/pool-manager";
import { handleTransfer } from "../src/position-manager";
import { createModifyLiquidityEvent, tokenIdToSalt } from "./pool-manager-utils";
import { createTransferEvent } from "./position-manager-utils";

const POOL_ID = Bytes.fromHexString("0x1111111111111111111111111111111111111111111111111111111111111111");
const POSITION_MANAGER = Address.fromString("0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e");
const ZERO = Address.fromString("0x0000000000000000000000000000000000000000");
const OWNER = Address.fromString("0x0000000000000000000000000000000000000001");

describe("Position merge across handlers", () => {
  beforeEach(() => {
    clearStore();
  });

  test("Transfer then ModifyLiquidity merge into one Position", () => {
    handleTransfer(createTransferEvent(ZERO, OWNER, BigInt.fromI32(10)));
    handleModifyLiquidity(createModifyLiquidityEvent(POOL_ID, POSITION_MANAGER, -120, 120, BigInt.fromI32(1000000), tokenIdToSalt(10)));

    assert.entityCount("Position", 1);
    assert.fieldEquals("Position", "10", "owner", OWNER.toHexString());
    assert.fieldEquals("Position", "10", "liquidity", "1000000");
    assert.fieldEquals("Position", "10", "pool", POOL_ID.toHexString());
    assert.fieldEquals("Position", "10", "closed", "false");
  });

  test("ModifyLiquidity then Transfer merge into one Position", () => {
    handleModifyLiquidity(createModifyLiquidityEvent(POOL_ID, POSITION_MANAGER, -120, 120, BigInt.fromI32(1000000), tokenIdToSalt(11)));
    handleTransfer(createTransferEvent(ZERO, OWNER, BigInt.fromI32(11)));

    assert.entityCount("Position", 1);
    assert.fieldEquals("Position", "11", "owner", OWNER.toHexString());
    assert.fieldEquals("Position", "11", "liquidity", "1000000");
    assert.fieldEquals("Position", "11", "pool", POOL_ID.toHexString());
    assert.fieldEquals("Position", "11", "closed", "false");
  });
});
