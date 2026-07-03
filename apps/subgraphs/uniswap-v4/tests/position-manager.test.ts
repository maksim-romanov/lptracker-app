import { assert, describe, test, clearStore, beforeEach } from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { handleTransfer } from "../src/position-manager";
import { createTransferEvent } from "./position-manager-utils";

const ZERO = Address.fromString("0x0000000000000000000000000000000000000000");
const OWNER = Address.fromString("0x0000000000000000000000000000000000000001");
const NEW_OWNER = Address.fromString("0x0000000000000000000000000000000000000002");

describe("handleTransfer", () => {
  beforeEach(() => {
    clearStore();
  });

  test("mint (from zero) creates position with owner", () => {
    handleTransfer(createTransferEvent(ZERO, OWNER, BigInt.fromI32(1)));
    assert.entityCount("Position", 1);
    assert.fieldEquals("Position", "1", "owner", OWNER.toHexString());
    assert.fieldEquals("Position", "1", "closed", "false");
  });

  test("transfer updates owner", () => {
    handleTransfer(createTransferEvent(ZERO, OWNER, BigInt.fromI32(2)));
    handleTransfer(createTransferEvent(OWNER, NEW_OWNER, BigInt.fromI32(2)));
    assert.fieldEquals("Position", "2", "owner", NEW_OWNER.toHexString());
  });

  test("burn (to zero) closes position", () => {
    handleTransfer(createTransferEvent(ZERO, OWNER, BigInt.fromI32(3)));
    handleTransfer(createTransferEvent(OWNER, ZERO, BigInt.fromI32(3)));
    assert.fieldEquals("Position", "3", "closed", "true");
  });
});
