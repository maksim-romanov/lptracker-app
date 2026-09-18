import { assert, describe, test, clearStore, beforeEach } from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Position } from "../generated/schema";
import { handleTransfer } from "../src/nonfungible-position-manager";
import { handleDeposit, handleWithdraw } from "../src/gauge";
import { createTransferEvent } from "./nonfungible-position-manager-utils";
import { createDepositEvent, createWithdrawEvent } from "./gauge-utils";

const OWNER = Address.fromString("0x0000000000000000000000000000000000000001");
const GAUGE = Address.fromString("0xF33a96b5932D9E9B9A0eDA447AbD8C9d48d2e0c8");
const NPM = Address.fromString("0xe1f8cd9AC4e4A65F54f38a5CdAfCA44f6dD68b53");

function seedPosition(tokenId: string, owner: Address): void {
  let position = new Position(tokenId);
  position.owner = owner;
  position.operator = Address.zero();
  position.tickLower = -120;
  position.tickUpper = 120;
  position.liquidity = BigInt.fromI32(1000000);
  position.nonce = BigInt.zero();
  position.staked = false;
  position.closed = false;
  position.createdAtBlock = BigInt.fromI32(1);
  position.createdAtTimestamp = BigInt.fromI32(1);
  position.updatedAtBlock = BigInt.fromI32(1);
  position.updatedAtTimestamp = BigInt.fromI32(1);
  position.save();
}

describe("Gauge staking", () => {
  beforeEach(() => {
    clearStore();
  });

  test("Staking keeps the real owner and marks the position staked", () => {
    seedPosition("10", OWNER);

    // The NFT moves to the gauge first — this alone would lose the real owner.
    let toGauge = createTransferEvent(OWNER, GAUGE, BigInt.fromI32(10));
    toGauge.address = NPM;
    handleTransfer(toGauge);
    assert.fieldEquals("Position", "10", "owner", GAUGE.toHexString());

    // The gauge Deposit restores the staker as owner and records the gauge.
    handleDeposit(createDepositEvent(GAUGE, OWNER, BigInt.fromI32(10), BigInt.fromI32(1000000)));

    assert.fieldEquals("Position", "10", "owner", OWNER.toHexString());
    assert.fieldEquals("Position", "10", "staked", "true");
    assert.fieldEquals("Position", "10", "gauge", GAUGE.toHexString());
  });

  test("Unstaking clears the staked state and returns the NFT to the owner", () => {
    seedPosition("11", OWNER);
    handleDeposit(createDepositEvent(GAUGE, OWNER, BigInt.fromI32(11), BigInt.fromI32(1000000)));
    assert.fieldEquals("Position", "11", "staked", "true");

    // Unstake: NFT returns to owner, then the gauge Withdraw clears the staked state.
    let fromGauge = createTransferEvent(GAUGE, OWNER, BigInt.fromI32(11));
    fromGauge.address = NPM;
    handleTransfer(fromGauge);
    handleWithdraw(createWithdrawEvent(GAUGE, OWNER, BigInt.fromI32(11), BigInt.fromI32(1000000)));

    assert.fieldEquals("Position", "11", "owner", OWNER.toHexString());
    assert.fieldEquals("Position", "11", "staked", "false");
  });
});
