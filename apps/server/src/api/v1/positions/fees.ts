import { Token } from "@uniswap/sdk-core";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import NonfungiblePositionManagerABI from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import { Pool } from "@uniswap/v3-sdk";
import { graphql } from "gql";
import type { PositionForFeesQuery, PositionForFeesQueryVariables } from "gql/graphql";
import { gqlClient } from "lib/graphql";
import { networks, Q128, Q256 } from "src/constants";
import { type Address, createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";

const getPositionForFeesQuery = graphql(`
  query PositionForFees($tokenId: ID!) {
    position(id: $tokenId) {
      id

      tickLower
      tickUpper

      liquidity

      pool {
        feeTier

        currentTick
        sqrtPriceX96

        token0 {
          id
          symbol
          decimals
        }

        token1 {
          id
          symbol
          decimals
        }
      }
    }
  }
`);

const publicClient = createPublicClient({
  chain: arbitrum,
  transport: http(networks.arbitrum.alchemy.rpcUrl),
});

const subInUint256 = (a: bigint, b: bigint) => (((a - b) % Q256) + Q256) % Q256;

const computeFeeGrowthInside = (
  currentTick: number,
  tickLower: number,
  tickUpper: number,
  feeGrowthGlobalX128: bigint,
  feeGrowthOutsideLowerX128: bigint,
  feeGrowthOutsideUpperX128: bigint,
) => {
  if (currentTick < tickLower) {
    return subInUint256(feeGrowthOutsideLowerX128, feeGrowthOutsideUpperX128);
  }

  if (currentTick >= tickUpper) {
    return subInUint256(feeGrowthOutsideUpperX128, feeGrowthOutsideLowerX128);
  }

  return subInUint256(feeGrowthGlobalX128, feeGrowthOutsideLowerX128 + feeGrowthOutsideUpperX128);
};

export async function getPositionFees(tokenId: string): Promise<Response> {
  const result = await gqlClient.request<PositionForFeesQuery, PositionForFeesQueryVariables>(getPositionForFeesQuery, { tokenId });

  if (!result.position) return Response.json({ error: "Position not found" }, { status: 404 });
  if (!result.position.pool) return Response.json({ error: "Pool not found" }, { status: 404 });

  const token0 = new Token(
    arbitrum.id,
    result.position.pool.token0.id,
    result.position.pool.token0.decimals,
    result.position.pool.token0.symbol,
    result.position.pool.token0.symbol,
  );
  const token1 = new Token(
    arbitrum.id,
    result.position.pool.token1.id,
    result.position.pool.token1.decimals,
    result.position.pool.token1.symbol,
    result.position.pool.token1.symbol,
  );

  const pool = new Pool(
    token0,
    token1,
    result.position.pool.feeTier,
    result.position.pool.sqrtPriceX96.toString(),
    result.position.liquidity.toString(),
    result.position.pool.currentTick,
  );

  const poolAddress = Pool.getAddress(token0, token1, result.position.pool.feeTier) as Address;

  const multicallResults = await publicClient.multicall({
    contracts: [
      { address: poolAddress, abi: IUniswapV3PoolABI.abi, functionName: "feeGrowthGlobal0X128" },
      { address: poolAddress, abi: IUniswapV3PoolABI.abi, functionName: "feeGrowthGlobal1X128" },
      { address: poolAddress, abi: IUniswapV3PoolABI.abi, functionName: "ticks", args: [result.position.tickLower] },
      { address: poolAddress, abi: IUniswapV3PoolABI.abi, functionName: "ticks", args: [result.position.tickUpper] },
      {
        address: networks.arbitrum.deployments.NonfungiblePositionManager,
        abi: NonfungiblePositionManagerABI.abi,
        functionName: "positions",
        args: [BigInt(tokenId)],
      },
    ],
  });

  if (multicallResults.some((r) => r.status === "failure")) {
    return Response.json({ error: "Failed to fetch on-chain data" }, { status: 500 });
  }

  type TickData = [bigint, bigint, bigint, bigint, bigint, bigint, bigint, boolean];
  type PositionData = [bigint, Address, Address, Address, number, number, number, bigint, bigint, bigint, bigint, bigint];

  const feeGrowthGlobal0X128 = multicallResults[0].result as bigint;
  const feeGrowthGlobal1X128 = multicallResults[1].result as bigint;
  const tickLowerData = multicallResults[2].result as TickData;
  const tickUpperData = multicallResults[3].result as TickData;
  const positionData = multicallResults[4].result as PositionData;

  const feeGrowthOutside0LowerX128 = tickLowerData[2];
  const feeGrowthOutside1LowerX128 = tickLowerData[3];
  const feeGrowthOutside0UpperX128 = tickUpperData[2];
  const feeGrowthOutside1UpperX128 = tickUpperData[3];

  const feeGrowthInside0LastX128 = positionData[8];
  const feeGrowthInside1LastX128 = positionData[9];
  const tokensOwed0 = positionData[10];
  const tokensOwed1 = positionData[11];
  const onChainLiquidity = positionData[7];

  const feeGrowthInside0X128 = computeFeeGrowthInside(
    result.position.pool.currentTick,
    result.position.tickLower,
    result.position.tickUpper,
    feeGrowthGlobal0X128,
    feeGrowthOutside0LowerX128,
    feeGrowthOutside0UpperX128,
  );

  const feeGrowthInside1X128 = computeFeeGrowthInside(
    result.position.pool.currentTick,
    result.position.tickLower,
    result.position.tickUpper,
    feeGrowthGlobal1X128,
    feeGrowthOutside1LowerX128,
    feeGrowthOutside1UpperX128,
  );

  const feeGrowthInside0DeltaX128 = subInUint256(feeGrowthInside0X128, feeGrowthInside0LastX128);
  const feeGrowthInside1DeltaX128 = subInUint256(feeGrowthInside1X128, feeGrowthInside1LastX128);

  const unclaimedFees0 = tokensOwed0 + (onChainLiquidity * feeGrowthInside0DeltaX128) / Q128;
  const unclaimedFees1 = tokensOwed1 + (onChainLiquidity * feeGrowthInside1DeltaX128) / Q128;

  // Format fees
  const fees0Formatted = Number(unclaimedFees0) / 10 ** token0.decimals;
  const fees1Formatted = Number(unclaimedFees1) / 10 ** token1.decimals;

  // Current prices
  const currentPriceT1PerT0 = pool.token0Price; // price of token0 in terms of token1
  const currentPriceT0PerT1 = pool.token1Price; // price of token1 in terms of token0

  // Total fees in terms of each token
  const totalInToken0 = fees0Formatted + fees1Formatted * Number(currentPriceT0PerT1.toSignificant(token0.decimals));
  const totalInToken1 = fees1Formatted + fees0Formatted * Number(currentPriceT1PerT0.toSignificant(token1.decimals));

  return Response.json({
    positionId: result.position.id,
    token0: {
      address: result.position.pool.token0.id,
      symbol: result.position.pool.token0.symbol,
      decimals: result.position.pool.token0.decimals,
    },
    token1: {
      address: result.position.pool.token1.id,
      symbol: result.position.pool.token1.symbol,
      decimals: result.position.pool.token1.decimals,
    },
    unclaimedFees: {
      token0PerToken1: {
        label: `${token0.symbol}/${token1.symbol}`,
        token0: fees0Formatted,
        token1: fees1Formatted,
        total: totalInToken0,
      },
      token1PerToken0: {
        label: `${token1.symbol}/${token0.symbol}`,
        token0: fees0Formatted,
        token1: fees1Formatted,
        total: totalInToken1,
      },
      raw: {
        token0: unclaimedFees0.toString(),
        token1: unclaimedFees1.toString(),
      },
    },
  });
}
