import { assert, describe, test, clearStore, beforeEach } from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { handleInitialize } from "../src/pool-manager";
import { createInitializeEvent, mockERC20Token, mockERC20TokenBytes32, padToBytes32 } from "./pool-manager-utils";

const POOL_ID = Bytes.fromHexString("0x1111111111111111111111111111111111111111111111111111111111111111");
const ETH = Address.fromString("0x0000000000000000000000000000000000000000");
const TOKEN0 = Address.fromString("0x1111111111111111111111111111111111111111");
const TOKEN1 = Address.fromString("0x2222222222222222222222222222222222222222");
const HOOKS = Address.fromString("0x0000000000000000000000000000000000000000");

describe("handleInitialize", () => {
  beforeEach(() => {
    clearStore();
  });

  test("creates Pool and both ERC-20 tokens", () => {
    mockERC20Token(TOKEN0, "TKN0", "Token Zero", 18);
    mockERC20Token(TOKEN1, "TKN1", "Token One", 6);

    // 79228162514264337593543950336 == 1 << 96 (price 1.0)
    let event = createInitializeEvent(POOL_ID, TOKEN0, TOKEN1, 3000, 60, HOOKS, BigInt.fromString("79228162514264337593543950336"), 0);
    handleInitialize(event);

    assert.entityCount("Pool", 1);
    assert.entityCount("Token", 2);
    assert.fieldEquals("Pool", POOL_ID.toHexString(), "feeTier", "3000");
    assert.fieldEquals("Pool", POOL_ID.toHexString(), "tickSpacing", "60");
    assert.fieldEquals("Pool", POOL_ID.toHexString(), "tick", "0");
    assert.fieldEquals("Pool", POOL_ID.toHexString(), "liquidity", "0");
    assert.fieldEquals("Token", TOKEN0.toHexString(), "symbol", "TKN0");
    assert.fieldEquals("Token", TOKEN1.toHexString(), "decimals", "6");
    assert.fieldEquals("Pool", POOL_ID.toHexString(), "isDynamicFee", "false");
  });

  test("flags dynamic-fee pools (fee == 0x800000)", () => {
    mockERC20Token(TOKEN0, "TKN0", "Token Zero", 18);
    mockERC20Token(TOKEN1, "TKN1", "Token One", 18);

    // 8388608 == 0x800000 == LPFeeLibrary.DYNAMIC_FEE_FLAG
    let event = createInitializeEvent(POOL_ID, TOKEN0, TOKEN1, 8388608, 60, HOOKS, BigInt.fromI32(1), 0);
    handleInitialize(event);

    assert.fieldEquals("Pool", POOL_ID.toHexString(), "isDynamicFee", "true");
    assert.fieldEquals("Pool", POOL_ID.toHexString(), "feeTier", "8388608");
  });

  test("decodes bytes32 symbol/name tokens (e.g. MKR) instead of UNKNOWN", () => {
    mockERC20Token(TOKEN1, "TKN1", "Token One", 18);
    mockERC20TokenBytes32(TOKEN0, padToBytes32("MKR"), padToBytes32("Maker"), 18);

    let event = createInitializeEvent(POOL_ID, TOKEN0, TOKEN1, 3000, 60, HOOKS, BigInt.fromI32(1), 0);
    handleInitialize(event);

    assert.fieldEquals("Token", TOKEN0.toHexString(), "symbol", "MKR");
    assert.fieldEquals("Token", TOKEN0.toHexString(), "name", "Maker");
  });

  test("treats currency0 == address(0) as native ETH without contract calls", () => {
    mockERC20Token(TOKEN1, "TKN1", "Token One", 6);

    let event = createInitializeEvent(POOL_ID, ETH, TOKEN1, 3000, 60, HOOKS, BigInt.fromI32(1), -100);
    handleInitialize(event);

    assert.entityCount("Token", 2);
    assert.fieldEquals("Token", ETH.toHexString(), "symbol", "ETH");
    assert.fieldEquals("Token", ETH.toHexString(), "name", "Ether");
    assert.fieldEquals("Token", ETH.toHexString(), "decimals", "18");
    assert.fieldEquals("Pool", POOL_ID.toHexString(), "tick", "-100");
  });
});
