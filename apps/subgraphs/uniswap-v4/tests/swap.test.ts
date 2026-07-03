import { assert, describe, test, clearStore, beforeEach } from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { handleInitialize, handleSwap } from "../src/pool-manager";
import { createInitializeEvent, createSwapEvent, mockERC20Token } from "./pool-manager-utils";

const POOL_ID = Bytes.fromHexString("0x1111111111111111111111111111111111111111111111111111111111111111");
const TOKEN0 = Address.fromString("0x1111111111111111111111111111111111111111");
const TOKEN1 = Address.fromString("0x2222222222222222222222222222222222222222");
const HOOKS = Address.fromString("0x0000000000000000000000000000000000000000");
const SWAPPER = Address.fromString("0x4444444444444444444444444444444444444444");

describe("handleSwap", () => {
  beforeEach(() => {
    clearStore();
  });

  test("updates pool sqrtPriceX96, tick and liquidity from the swap", () => {
    mockERC20Token(TOKEN0, "TKN0", "Token Zero", 18);
    mockERC20Token(TOKEN1, "TKN1", "Token One", 18);
    handleInitialize(createInitializeEvent(POOL_ID, TOKEN0, TOKEN1, 3000, 60, HOOKS, BigInt.fromString("79228162514264337593543950336"), 0));

    let swap = createSwapEvent(
      POOL_ID,
      SWAPPER,
      BigInt.fromI32(-1000),
      BigInt.fromI32(2000),
      BigInt.fromString("80000000000000000000000000000"),
      BigInt.fromI32(5000000),
      -50,
      3000,
    );
    handleSwap(swap);

    assert.fieldEquals("Pool", POOL_ID.toHexString(), "sqrtPriceX96", "80000000000000000000000000000");
    assert.fieldEquals("Pool", POOL_ID.toHexString(), "tick", "-50");
    assert.fieldEquals("Pool", POOL_ID.toHexString(), "liquidity", "5000000");
  });

  test("ignores a swap for an unknown pool", () => {
    let swap = createSwapEvent(POOL_ID, SWAPPER, BigInt.zero(), BigInt.zero(), BigInt.fromI32(1), BigInt.fromI32(1), 0, 3000);
    handleSwap(swap);
    assert.entityCount("Pool", 0);
  });
});
