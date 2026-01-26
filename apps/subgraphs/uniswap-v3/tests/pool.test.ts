import { assert, describe, test, clearStore, beforeEach, afterEach, createMockedFunction } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Pool, Token, Tick } from "../generated/schema";
import { handleSwap, handleMint, handleBurn } from "../src/pool";
import { createSwapEvent, createMintEvent, createBurnEvent } from "./pool-utils";

// Test addresses
const POOL_ADDRESS = Address.fromString("0x3333333333333333333333333333333333333333");
const TOKEN0_ADDRESS = Address.fromString("0x1111111111111111111111111111111111111111");
const TOKEN1_ADDRESS = Address.fromString("0x2222222222222222222222222222222222222222");
const SENDER_ADDRESS = Address.fromString("0x4444444444444444444444444444444444444444");
const RECIPIENT_ADDRESS = Address.fromString("0x5555555555555555555555555555555555555555");

// Helper to mock pool contract calls
function mockPoolContractCalls(): void {
  // Mock ticks for common tick values
  let tickIndices: i32[] = [-887220, 887220, -100, 100];
  for (let i = 0; i < tickIndices.length; i++) {
    createMockedFunction(POOL_ADDRESS, "ticks", "ticks(int24):(uint128,int128,uint256,uint256,int56,uint160,uint32,bool)")
      .withArgs([ethereum.Value.fromI32(tickIndices[i])])
      .returns([
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(500000)), // liquidityGross
        ethereum.Value.fromSignedBigInt(BigInt.fromI32(100000)), // liquidityNet
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100)), // feeGrowthOutside0X128
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(200)), // feeGrowthOutside1X128
        ethereum.Value.fromSignedBigInt(BigInt.fromI32(0)), // tickCumulativeOutside
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)), // secondsPerLiquidityOutsideX128
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)), // secondsOutside
        ethereum.Value.fromBoolean(true), // initialized
      ]);
  }
}

// Helper to create test pool and tokens
function createTestPoolAndTokens(): void {
  let token0 = new Token(TOKEN0_ADDRESS.toHexString());
  token0.symbol = "USDC";
  token0.name = "USD Coin";
  token0.decimals = 6;
  token0.save();

  let token1 = new Token(TOKEN1_ADDRESS.toHexString());
  token1.symbol = "WETH";
  token1.name = "Wrapped Ether";
  token1.decimals = 18;
  token1.save();

  let pool = new Pool(POOL_ADDRESS.toHexString());
  pool.token0 = token0.id;
  pool.token1 = token1.id;
  pool.feeTier = 3000;
  pool.sqrtPriceX96 = BigInt.fromString("79228162514264337593543950336");
  pool.currentTick = 0;
  pool.liquidity = BigInt.fromI32(1000000);
  pool.createdAtBlock = BigInt.fromI32(1);
  pool.createdAtTimestamp = BigInt.fromI32(1000);
  pool.save();

  // Setup mocks
  mockPoolContractCalls();
}

describe("Pool Event Tests", () => {
  beforeEach(() => {
    clearStore();
    createTestPoolAndTokens();
  });

  afterEach(() => {
    clearStore();
  });

  test("Should update pool state on Swap event", () => {
    let newSqrtPriceX96 = BigInt.fromString("80000000000000000000000000000");
    let newTick = 100;
    let newLiquidity = BigInt.fromI32(2000000);

    let event = createSwapEvent(
      SENDER_ADDRESS,
      RECIPIENT_ADDRESS,
      BigInt.fromI32(1000), // amount0
      BigInt.fromI32(-500), // amount1
      newSqrtPriceX96,
      newLiquidity,
      newTick,
    );
    event.address = POOL_ADDRESS;

    handleSwap(event);

    // Assertions
    assert.fieldEquals("Pool", POOL_ADDRESS.toHexString(), "sqrtPriceX96", newSqrtPriceX96.toString());
    assert.fieldEquals("Pool", POOL_ADDRESS.toHexString(), "currentTick", newTick.toString());
    assert.fieldEquals("Pool", POOL_ADDRESS.toHexString(), "liquidity", newLiquidity.toString());
  });

  test("Should increase liquidity on Mint event", () => {
    let initialLiquidity = BigInt.fromI32(1000000);
    let addedLiquidity = BigInt.fromI32(500000);
    let expectedLiquidity = initialLiquidity.plus(addedLiquidity);

    let event = createMintEvent(
      SENDER_ADDRESS,
      RECIPIENT_ADDRESS,
      -887220, // tickLower
      887220, // tickUpper
      addedLiquidity,
      BigInt.fromI32(100), // amount0
      BigInt.fromI32(200), // amount1
    );
    event.address = POOL_ADDRESS;

    handleMint(event);

    // Assertions
    assert.fieldEquals("Pool", POOL_ADDRESS.toHexString(), "liquidity", expectedLiquidity.toString());
  });

  test("Should decrease liquidity on Burn event", () => {
    let initialLiquidity = BigInt.fromI32(1000000);
    let removedLiquidity = BigInt.fromI32(300000);
    let expectedLiquidity = initialLiquidity.minus(removedLiquidity);

    let event = createBurnEvent(
      SENDER_ADDRESS,
      -887220, // tickLower
      887220, // tickUpper
      removedLiquidity,
      BigInt.fromI32(50), // amount0
      BigInt.fromI32(100), // amount1
    );
    event.address = POOL_ADDRESS;

    handleBurn(event);

    // Assertions
    assert.fieldEquals("Pool", POOL_ADDRESS.toHexString(), "liquidity", expectedLiquidity.toString());
  });

  test("Should handle multiple swaps correctly", () => {
    // First swap
    let event1 = createSwapEvent(
      SENDER_ADDRESS,
      RECIPIENT_ADDRESS,
      BigInt.fromI32(1000),
      BigInt.fromI32(-500),
      BigInt.fromString("80000000000000000000000000000"),
      BigInt.fromI32(1500000),
      50,
    );
    event1.address = POOL_ADDRESS;
    handleSwap(event1);

    assert.fieldEquals("Pool", POOL_ADDRESS.toHexString(), "currentTick", "50");

    // Second swap
    let event2 = createSwapEvent(
      SENDER_ADDRESS,
      RECIPIENT_ADDRESS,
      BigInt.fromI32(-500),
      BigInt.fromI32(250),
      BigInt.fromString("78000000000000000000000000000"),
      BigInt.fromI32(1400000),
      -25,
    );
    event2.address = POOL_ADDRESS;
    handleSwap(event2);

    assert.fieldEquals("Pool", POOL_ADDRESS.toHexString(), "currentTick", "-25");
    assert.fieldEquals("Pool", POOL_ADDRESS.toHexString(), "liquidity", "1400000");
  });

  test("Should not fail for non-existent pool", () => {
    let nonExistentPool = Address.fromString("0x9999999999999999999999999999999999999999");

    let event = createSwapEvent(
      SENDER_ADDRESS,
      RECIPIENT_ADDRESS,
      BigInt.fromI32(1000),
      BigInt.fromI32(-500),
      BigInt.fromString("80000000000000000000000000000"),
      BigInt.fromI32(2000000),
      100,
    );
    event.address = nonExistentPool;

    // Should not throw
    handleSwap(event);

    // Original pool should be unchanged
    assert.fieldEquals("Pool", POOL_ADDRESS.toHexString(), "currentTick", "0");
  });

  test("Should create Tick entities on Mint", () => {
    let tickLower = -887220;
    let tickUpper = 887220;

    let event = createMintEvent(
      SENDER_ADDRESS,
      RECIPIENT_ADDRESS,
      tickLower,
      tickUpper,
      BigInt.fromI32(500000),
      BigInt.fromI32(100),
      BigInt.fromI32(200),
    );
    event.address = POOL_ADDRESS;

    handleMint(event);

    // Check Tick entities were created
    let tickLowerId = POOL_ADDRESS.toHexString() + "-" + tickLower.toString();
    let tickUpperId = POOL_ADDRESS.toHexString() + "-" + tickUpper.toString();

    assert.fieldEquals("Tick", tickLowerId, "tickIdx", tickLower.toString());
    assert.fieldEquals("Tick", tickLowerId, "liquidityGross", "500000");
    assert.fieldEquals("Tick", tickLowerId, "feeGrowthOutside0X128", "100");
    assert.fieldEquals("Tick", tickLowerId, "feeGrowthOutside1X128", "200");

    assert.fieldEquals("Tick", tickUpperId, "tickIdx", tickUpper.toString());
  });
});
