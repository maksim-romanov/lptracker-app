import { assert, describe, test, clearStore, beforeEach, afterEach, createMockedFunction } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Pool, Token } from "../generated/schema";
import { handlePoolCreated } from "../src/factory";
import { createPoolCreatedEvent } from "./factory-utils";

// Test addresses
const TOKEN0_ADDRESS = Address.fromString("0x1111111111111111111111111111111111111111");
const TOKEN1_ADDRESS = Address.fromString("0x2222222222222222222222222222222222222222");
const POOL_ADDRESS = Address.fromString("0x3333333333333333333333333333333333333333");

// Helper to mock ERC20 token
function mockERC20Token(tokenAddress: Address, symbol: string, name: string, decimals: i32): void {
  createMockedFunction(tokenAddress, "symbol", "symbol():(string)").returns([ethereum.Value.fromString(symbol)]);

  createMockedFunction(tokenAddress, "name", "name():(string)").returns([ethereum.Value.fromString(name)]);

  createMockedFunction(tokenAddress, "decimals", "decimals():(uint8)").returns([ethereum.Value.fromI32(decimals)]);
}

// Helper to mock Pool.slot0
function mockPoolSlot0(poolAddress: Address, sqrtPriceX96: BigInt, tick: i32): void {
  createMockedFunction(poolAddress, "slot0", "slot0():(uint160,int24,uint16,uint16,uint16,uint8,bool)").returns([
    ethereum.Value.fromUnsignedBigInt(sqrtPriceX96),
    ethereum.Value.fromI32(tick),
    ethereum.Value.fromI32(0),
    ethereum.Value.fromI32(0),
    ethereum.Value.fromI32(0),
    ethereum.Value.fromI32(0),
    ethereum.Value.fromBoolean(true),
  ]);
}

// Helper to mock Pool.liquidity
function mockPoolLiquidity(poolAddress: Address, liquidity: BigInt): void {
  createMockedFunction(poolAddress, "liquidity", "liquidity():(uint128)").returns([ethereum.Value.fromUnsignedBigInt(liquidity)]);
}

describe("Factory Tests", () => {
  beforeEach(() => {
    clearStore();
  });

  afterEach(() => {
    clearStore();
  });

  test("Should create pool and tokens on PoolCreated event", () => {
    let fee = 3000;
    let tickSpacing = 60;
    let sqrtPriceX96 = BigInt.fromString("79228162514264337593543950336"); // 1:1 price
    let poolLiquidity = BigInt.fromI32(1000000);

    // Setup mocks
    mockERC20Token(TOKEN0_ADDRESS, "USDC", "USD Coin", 6);
    mockERC20Token(TOKEN1_ADDRESS, "WETH", "Wrapped Ether", 18);
    mockPoolSlot0(POOL_ADDRESS, sqrtPriceX96, 0);
    mockPoolLiquidity(POOL_ADDRESS, poolLiquidity);

    // Create event
    let event = createPoolCreatedEvent(TOKEN0_ADDRESS, TOKEN1_ADDRESS, fee, tickSpacing, POOL_ADDRESS);

    handlePoolCreated(event);

    // Assertions - Pool created
    assert.entityCount("Pool", 1);
    assert.fieldEquals("Pool", POOL_ADDRESS.toHexString(), "token0", TOKEN0_ADDRESS.toHexString());
    assert.fieldEquals("Pool", POOL_ADDRESS.toHexString(), "token1", TOKEN1_ADDRESS.toHexString());
    assert.fieldEquals("Pool", POOL_ADDRESS.toHexString(), "feeTier", fee.toString());
    assert.fieldEquals("Pool", POOL_ADDRESS.toHexString(), "sqrtPriceX96", sqrtPriceX96.toString());
    assert.fieldEquals("Pool", POOL_ADDRESS.toHexString(), "currentTick", "0");
    assert.fieldEquals("Pool", POOL_ADDRESS.toHexString(), "liquidity", poolLiquidity.toString());

    // Assertions - Tokens created
    assert.entityCount("Token", 2);
    assert.fieldEquals("Token", TOKEN0_ADDRESS.toHexString(), "symbol", "USDC");
    assert.fieldEquals("Token", TOKEN0_ADDRESS.toHexString(), "name", "USD Coin");
    assert.fieldEquals("Token", TOKEN0_ADDRESS.toHexString(), "decimals", "6");

    assert.fieldEquals("Token", TOKEN1_ADDRESS.toHexString(), "symbol", "WETH");
    assert.fieldEquals("Token", TOKEN1_ADDRESS.toHexString(), "name", "Wrapped Ether");
    assert.fieldEquals("Token", TOKEN1_ADDRESS.toHexString(), "decimals", "18");
  });

  test("Should not duplicate pool on second PoolCreated event", () => {
    let fee = 3000;
    let tickSpacing = 60;
    let sqrtPriceX96 = BigInt.fromString("79228162514264337593543950336");
    let poolLiquidity = BigInt.fromI32(1000000);

    // Setup mocks
    mockERC20Token(TOKEN0_ADDRESS, "USDC", "USD Coin", 6);
    mockERC20Token(TOKEN1_ADDRESS, "WETH", "Wrapped Ether", 18);
    mockPoolSlot0(POOL_ADDRESS, sqrtPriceX96, 0);
    mockPoolLiquidity(POOL_ADDRESS, poolLiquidity);

    // Create first event
    let event1 = createPoolCreatedEvent(TOKEN0_ADDRESS, TOKEN1_ADDRESS, fee, tickSpacing, POOL_ADDRESS);
    handlePoolCreated(event1);

    // Create second event with same pool
    let event2 = createPoolCreatedEvent(TOKEN0_ADDRESS, TOKEN1_ADDRESS, fee, tickSpacing, POOL_ADDRESS);
    handlePoolCreated(event2);

    // Should still only have 1 pool
    assert.entityCount("Pool", 1);
  });

  test("Should handle tokens with different fee tiers", () => {
    let sqrtPriceX96 = BigInt.fromString("79228162514264337593543950336");
    let poolLiquidity = BigInt.fromI32(1000000);

    let pool1 = Address.fromString("0x4444444444444444444444444444444444444444");
    let pool2 = Address.fromString("0x5555555555555555555555555555555555555555");

    // Setup mocks for both pools
    mockERC20Token(TOKEN0_ADDRESS, "USDC", "USD Coin", 6);
    mockERC20Token(TOKEN1_ADDRESS, "WETH", "Wrapped Ether", 18);

    mockPoolSlot0(pool1, sqrtPriceX96, 0);
    mockPoolLiquidity(pool1, poolLiquidity);

    mockPoolSlot0(pool2, sqrtPriceX96, 100);
    mockPoolLiquidity(pool2, poolLiquidity);

    // Create 0.3% pool
    let event1 = createPoolCreatedEvent(TOKEN0_ADDRESS, TOKEN1_ADDRESS, 3000, 60, pool1);
    handlePoolCreated(event1);

    // Create 1% pool
    let event2 = createPoolCreatedEvent(TOKEN0_ADDRESS, TOKEN1_ADDRESS, 10000, 200, pool2);
    handlePoolCreated(event2);

    // Should have 2 pools but only 2 tokens (reused)
    assert.entityCount("Pool", 2);
    assert.entityCount("Token", 2);

    assert.fieldEquals("Pool", pool1.toHexString(), "feeTier", "3000");
    assert.fieldEquals("Pool", pool2.toHexString(), "feeTier", "10000");
  });
});
