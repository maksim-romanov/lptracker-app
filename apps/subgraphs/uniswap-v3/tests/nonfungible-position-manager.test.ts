import { assert, describe, test, clearStore, beforeEach, afterEach, createMockedFunction } from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Position, Pool, Token } from "../generated/schema";
import { handleTransfer, handleIncreaseLiquidity, handleDecreaseLiquidity, handleCollect } from "../src/nonfungible-position-manager";
import {
  createTransferEvent,
  createIncreaseLiquidityEvent,
  createDecreaseLiquidityEvent,
  createCollectEvent,
} from "./nonfungible-position-manager-utils";

// Test addresses
const ZERO_ADDRESS = Address.fromString("0x0000000000000000000000000000000000000000");
const OWNER_ADDRESS = Address.fromString("0x0000000000000000000000000000000000000001");
const NEW_OWNER_ADDRESS = Address.fromString("0x0000000000000000000000000000000000000002");
const CONTRACT_ADDRESS = Address.fromString("0xC36442b4a4522E871399CD717aBDD847Ab11FE88");
const FACTORY_ADDRESS = Address.fromString("0x1F98431c8aD98523631AE4a59f267346ea31F984");
const POOL_ADDRESS = Address.fromString("0x3333333333333333333333333333333333333333");
const TOKEN0_ADDRESS = Address.fromString("0x1111111111111111111111111111111111111111");
const TOKEN1_ADDRESS = Address.fromString("0x2222222222222222222222222222222222222222");

// Helper function to create position contract return data
function createPositionData(
  nonce: BigInt,
  operator: Address,
  token0: Address,
  token1: Address,
  fee: i32,
  tickLower: i32,
  tickUpper: i32,
  liquidity: BigInt,
  feeGrowthInside0LastX128: BigInt,
  feeGrowthInside1LastX128: BigInt,
  tokensOwed0: BigInt,
  tokensOwed1: BigInt,
): ethereum.Value[] {
  return [
    ethereum.Value.fromUnsignedBigInt(nonce),
    ethereum.Value.fromAddress(operator),
    ethereum.Value.fromAddress(token0),
    ethereum.Value.fromAddress(token1),
    ethereum.Value.fromI32(fee),
    ethereum.Value.fromI32(tickLower),
    ethereum.Value.fromI32(tickUpper),
    ethereum.Value.fromUnsignedBigInt(liquidity),
    ethereum.Value.fromUnsignedBigInt(feeGrowthInside0LastX128),
    ethereum.Value.fromUnsignedBigInt(feeGrowthInside1LastX128),
    ethereum.Value.fromUnsignedBigInt(tokensOwed0),
    ethereum.Value.fromUnsignedBigInt(tokensOwed1),
  ];
}

// Helper to mock Factory.getPool
function mockFactoryGetPool(token0: Address, token1: Address, fee: i32, poolAddress: Address): void {
  createMockedFunction(FACTORY_ADDRESS, "getPool", "getPool(address,address,uint24):(address)")
    .withArgs([ethereum.Value.fromAddress(token0), ethereum.Value.fromAddress(token1), ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(fee))])
    .returns([ethereum.Value.fromAddress(poolAddress)]);
}

// Helper to mock ERC20 token
function mockERC20Token(tokenAddress: Address, symbol: string, name: string, decimals: i32): void {
  createMockedFunction(tokenAddress, "symbol", "symbol():(string)").returns([ethereum.Value.fromString(symbol)]);

  createMockedFunction(tokenAddress, "name", "name():(string)").returns([ethereum.Value.fromString(name)]);

  createMockedFunction(tokenAddress, "decimals", "decimals():(uint8)").returns([ethereum.Value.fromI32(decimals)]);
}

// Setup all mocks for pool creation
function setupPoolMocks(token0: Address, token1: Address, fee: i32, poolAddress: Address): void {
  mockFactoryGetPool(token0, token1, fee, poolAddress);
  mockERC20Token(token0, "TOKEN0", "Token Zero", 18);
  mockERC20Token(token1, "TOKEN1", "Token One", 18);
}

describe("Position Lifecycle Tests", () => {
  beforeEach(() => {
    clearStore();
  });

  afterEach(() => {
    clearStore();
  });

  test("Should create new position on mint (transfer from zero address)", () => {
    let tokenId = BigInt.fromI32(1);
    let liquidity = BigInt.fromI32(1000000);

    // Setup mocks
    setupPoolMocks(TOKEN0_ADDRESS, TOKEN1_ADDRESS, 3000, POOL_ADDRESS);

    // Mock contract call to positions()
    createMockedFunction(
      CONTRACT_ADDRESS,
      "positions",
      "positions(uint256):(uint96,address,address,address,uint24,int24,int24,uint128,uint256,uint256,uint128,uint128)",
    )
      .withArgs([ethereum.Value.fromUnsignedBigInt(tokenId)])
      .returns(
        createPositionData(
          BigInt.fromI32(1), // nonce
          Address.zero(), // operator
          TOKEN0_ADDRESS,
          TOKEN1_ADDRESS,
          3000, // fee 0.3%
          -887220, // tickLower
          887220, // tickUpper
          liquidity,
          BigInt.zero(),
          BigInt.zero(),
          BigInt.zero(),
          BigInt.zero(),
        ),
      );

    // Create transfer event (mint)
    let transferEvent = createTransferEvent(ZERO_ADDRESS, OWNER_ADDRESS, tokenId);
    transferEvent.address = CONTRACT_ADDRESS;

    handleTransfer(transferEvent);

    // Assertions
    assert.entityCount("Position", 1);
    assert.entityCount("Pool", 1);
    assert.entityCount("Token", 2);

    assert.fieldEquals("Position", "1", "owner", OWNER_ADDRESS.toHexString());
    assert.fieldEquals("Position", "1", "liquidity", liquidity.toString());
    assert.fieldEquals("Position", "1", "closed", "false");
    assert.fieldEquals("Position", "1", "pool", POOL_ADDRESS.toHexString());
    assert.fieldEquals("Position", "1", "tickLower", "-887220");
    assert.fieldEquals("Position", "1", "tickUpper", "887220");

    // Check pool was created correctly
    assert.fieldEquals("Pool", POOL_ADDRESS.toHexString(), "feeTier", "3000");
  });

  test("Should transfer position to new owner", () => {
    let tokenId = BigInt.fromI32(2);
    let liquidity = BigInt.fromI32(5000000);

    // Setup mocks
    setupPoolMocks(TOKEN0_ADDRESS, TOKEN1_ADDRESS, 3000, POOL_ADDRESS);

    // Mock contract call
    createMockedFunction(
      CONTRACT_ADDRESS,
      "positions",
      "positions(uint256):(uint96,address,address,address,uint24,int24,int24,uint128,uint256,uint256,uint128,uint128)",
    )
      .withArgs([ethereum.Value.fromUnsignedBigInt(tokenId)])
      .returns(
        createPositionData(
          BigInt.fromI32(1),
          Address.zero(),
          TOKEN0_ADDRESS,
          TOKEN1_ADDRESS,
          3000,
          -887220,
          887220,
          liquidity,
          BigInt.zero(),
          BigInt.zero(),
          BigInt.zero(),
          BigInt.zero(),
        ),
      );

    // First create position
    let mintEvent = createTransferEvent(ZERO_ADDRESS, OWNER_ADDRESS, tokenId);
    mintEvent.address = CONTRACT_ADDRESS;
    handleTransfer(mintEvent);

    // Then transfer to new owner
    let transferEvent = createTransferEvent(OWNER_ADDRESS, NEW_OWNER_ADDRESS, tokenId);
    transferEvent.address = CONTRACT_ADDRESS;
    handleTransfer(transferEvent);

    // Assertions
    assert.entityCount("Position", 1);
    assert.fieldEquals("Position", "2", "owner", NEW_OWNER_ADDRESS.toHexString());
    assert.fieldEquals("Position", "2", "closed", "false");
  });

  test("Should close position on burn (transfer to zero address)", () => {
    let tokenId = BigInt.fromI32(3);

    // Setup mocks
    setupPoolMocks(TOKEN0_ADDRESS, TOKEN1_ADDRESS, 3000, POOL_ADDRESS);

    // Mock contract call for mint
    createMockedFunction(
      CONTRACT_ADDRESS,
      "positions",
      "positions(uint256):(uint96,address,address,address,uint24,int24,int24,uint128,uint256,uint256,uint128,uint128)",
    )
      .withArgs([ethereum.Value.fromUnsignedBigInt(tokenId)])
      .returns(
        createPositionData(
          BigInt.fromI32(1),
          Address.zero(),
          TOKEN0_ADDRESS,
          TOKEN1_ADDRESS,
          3000,
          -887220,
          887220,
          BigInt.fromI32(1000000),
          BigInt.zero(),
          BigInt.zero(),
          BigInt.zero(),
          BigInt.zero(),
        ),
      );

    // Create position
    let mintEvent = createTransferEvent(ZERO_ADDRESS, OWNER_ADDRESS, tokenId);
    mintEvent.address = CONTRACT_ADDRESS;
    handleTransfer(mintEvent);

    // Burn position
    let burnEvent = createTransferEvent(OWNER_ADDRESS, ZERO_ADDRESS, tokenId);
    burnEvent.address = CONTRACT_ADDRESS;
    handleTransfer(burnEvent);

    // Assertions
    assert.entityCount("Position", 1);
    assert.fieldEquals("Position", "3", "closed", "true");
  });

  test("Should update liquidity on IncreaseLiquidity event", () => {
    let tokenId = BigInt.fromI32(4);
    let initialLiquidity = BigInt.fromI32(1000000);
    let addedLiquidity = BigInt.fromI32(500000);
    let finalLiquidity = initialLiquidity.plus(addedLiquidity);

    // Setup mocks
    setupPoolMocks(TOKEN0_ADDRESS, TOKEN1_ADDRESS, 3000, POOL_ADDRESS);

    // Mock initial position
    createMockedFunction(
      CONTRACT_ADDRESS,
      "positions",
      "positions(uint256):(uint96,address,address,address,uint24,int24,int24,uint128,uint256,uint256,uint128,uint128)",
    )
      .withArgs([ethereum.Value.fromUnsignedBigInt(tokenId)])
      .returns(
        createPositionData(
          BigInt.fromI32(1),
          Address.zero(),
          TOKEN0_ADDRESS,
          TOKEN1_ADDRESS,
          3000,
          -887220,
          887220,
          initialLiquidity,
          BigInt.zero(),
          BigInt.zero(),
          BigInt.zero(),
          BigInt.zero(),
        ),
      );

    // Create position
    let mintEvent = createTransferEvent(ZERO_ADDRESS, OWNER_ADDRESS, tokenId);
    mintEvent.address = CONTRACT_ADDRESS;
    handleTransfer(mintEvent);

    // Mock updated position after increase
    createMockedFunction(
      CONTRACT_ADDRESS,
      "positions",
      "positions(uint256):(uint96,address,address,address,uint24,int24,int24,uint128,uint256,uint256,uint128,uint128)",
    )
      .withArgs([ethereum.Value.fromUnsignedBigInt(tokenId)])
      .returns(
        createPositionData(
          BigInt.fromI32(1),
          Address.zero(),
          TOKEN0_ADDRESS,
          TOKEN1_ADDRESS,
          3000,
          -887220,
          887220,
          finalLiquidity,
          BigInt.fromI32(100000),
          BigInt.fromI32(200000),
          BigInt.zero(),
          BigInt.zero(),
        ),
      );

    // Increase liquidity
    let increaseEvent = createIncreaseLiquidityEvent(tokenId, addedLiquidity, BigInt.fromI32(100), BigInt.fromI32(200));
    increaseEvent.address = CONTRACT_ADDRESS;
    handleIncreaseLiquidity(increaseEvent);

    // Assertions
    assert.fieldEquals("Position", "4", "liquidity", finalLiquidity.toString());
  });

  test("Should auto-close position when liquidity is zero", () => {
    let tokenId = BigInt.fromI32(5);

    // Setup mocks
    setupPoolMocks(TOKEN0_ADDRESS, TOKEN1_ADDRESS, 3000, POOL_ADDRESS);

    // Mock initial position with liquidity
    createMockedFunction(
      CONTRACT_ADDRESS,
      "positions",
      "positions(uint256):(uint96,address,address,address,uint24,int24,int24,uint128,uint256,uint256,uint128,uint128)",
    )
      .withArgs([ethereum.Value.fromUnsignedBigInt(tokenId)])
      .returns(
        createPositionData(
          BigInt.fromI32(1),
          Address.zero(),
          TOKEN0_ADDRESS,
          TOKEN1_ADDRESS,
          3000,
          -887220,
          887220,
          BigInt.fromI32(1000000),
          BigInt.zero(),
          BigInt.zero(),
          BigInt.zero(),
          BigInt.zero(),
        ),
      );

    // Create position
    let mintEvent = createTransferEvent(ZERO_ADDRESS, OWNER_ADDRESS, tokenId);
    mintEvent.address = CONTRACT_ADDRESS;
    handleTransfer(mintEvent);

    assert.fieldEquals("Position", "5", "closed", "false");

    // Mock position after removing all liquidity
    createMockedFunction(
      CONTRACT_ADDRESS,
      "positions",
      "positions(uint256):(uint96,address,address,address,uint24,int24,int24,uint128,uint256,uint256,uint128,uint128)",
    )
      .withArgs([ethereum.Value.fromUnsignedBigInt(tokenId)])
      .returns(
        createPositionData(
          BigInt.fromI32(1),
          Address.zero(),
          TOKEN0_ADDRESS,
          TOKEN1_ADDRESS,
          3000,
          -887220,
          887220,
          BigInt.zero(), // no liquidity
          BigInt.zero(),
          BigInt.zero(),
          BigInt.zero(), // no tokensOwed0
          BigInt.zero(), // no tokensOwed1
        ),
      );

    // Decrease liquidity to zero
    let decreaseEvent = createDecreaseLiquidityEvent(tokenId, BigInt.fromI32(1000000), BigInt.fromI32(100), BigInt.fromI32(200));
    decreaseEvent.address = CONTRACT_ADDRESS;
    handleDecreaseLiquidity(decreaseEvent);

    // Assertions - position should be auto-closed
    assert.fieldEquals("Position", "5", "liquidity", "0");
    assert.fieldEquals("Position", "5", "closed", "true");
  });

  test("Should handle Collect event without closing position with liquidity", () => {
    let tokenId = BigInt.fromI32(6);

    // Setup mocks
    setupPoolMocks(TOKEN0_ADDRESS, TOKEN1_ADDRESS, 3000, POOL_ADDRESS);

    // Mock initial position
    createMockedFunction(
      CONTRACT_ADDRESS,
      "positions",
      "positions(uint256):(uint96,address,address,address,uint24,int24,int24,uint128,uint256,uint256,uint128,uint128)",
    )
      .withArgs([ethereum.Value.fromUnsignedBigInt(tokenId)])
      .returns(
        createPositionData(
          BigInt.fromI32(1),
          Address.zero(),
          TOKEN0_ADDRESS,
          TOKEN1_ADDRESS,
          3000,
          -887220,
          887220,
          BigInt.fromI32(1000000),
          BigInt.zero(),
          BigInt.zero(),
          BigInt.fromI32(1000),
          BigInt.fromI32(2000),
        ),
      );

    // Create position
    let mintEvent = createTransferEvent(ZERO_ADDRESS, OWNER_ADDRESS, tokenId);
    mintEvent.address = CONTRACT_ADDRESS;
    handleTransfer(mintEvent);

    // Mock position after collecting fees (still has liquidity)
    createMockedFunction(
      CONTRACT_ADDRESS,
      "positions",
      "positions(uint256):(uint96,address,address,address,uint24,int24,int24,uint128,uint256,uint256,uint128,uint128)",
    )
      .withArgs([ethereum.Value.fromUnsignedBigInt(tokenId)])
      .returns(
        createPositionData(
          BigInt.fromI32(1),
          Address.zero(),
          TOKEN0_ADDRESS,
          TOKEN1_ADDRESS,
          3000,
          -887220,
          887220,
          BigInt.fromI32(1000000), // still has liquidity
          BigInt.zero(),
          BigInt.zero(),
          BigInt.zero(),
          BigInt.zero(),
        ),
      );

    // Collect fees
    let collectEvent = createCollectEvent(tokenId, OWNER_ADDRESS, BigInt.fromI32(1000), BigInt.fromI32(2000));
    collectEvent.address = CONTRACT_ADDRESS;
    handleCollect(collectEvent);

    // Assertions - position still open because it has liquidity
    assert.fieldEquals("Position", "6", "liquidity", "1000000");
    assert.fieldEquals("Position", "6", "closed", "false");
  });
});
