import { Token } from "@uniswap/sdk-core";
import { Pool, Position, TickMath, tickToPrice } from "@uniswap/v3-sdk";
import { graphql } from "gql";
import type { PositionQuery, PositionQueryVariables } from "gql/graphql";
import { gqlClient } from "lib/graphql";
import { arbitrum } from "viem/chains";
import JSBI from 'jsbi'

const getPositionQuery = graphql(`
  query Position($tokenId: ID!) {
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

export async function getPosition(tokenId: string): Promise<Response> {
  const result = await gqlClient.request<PositionQuery, PositionQueryVariables>(getPositionQuery, { tokenId });

  if(!result.position) return Response.json({ error: "Position not found" }, { status: 404 });
  if(!result.position.pool) return Response.json({ error: "Pool not found" }, { status: 404 });

  const token0 = new Token(arbitrum.id, result.position.pool.token0.id, result.position.pool.token0.decimals, result.position.pool.token0.symbol, result.position.pool.token0.symbol)
  const token1 = new Token(arbitrum.id, result.position.pool.token1.id, result.position.pool.token1.decimals, result.position.pool.token1.symbol, result.position.pool.token1.symbol)

  const pool = new Pool(
    token0,
    token1,
    result.position.pool.feeTier,
    result.position.pool.sqrtPriceX96.toString(),
    result.position.liquidity.toString(),
    result.position.pool.currentTick
  )

  const uniPosition = new Position({ pool, liquidity: result.position.liquidity.toString(), tickLower: result.position.tickLower, tickUpper: result.position.tickUpper })

  const amount0 = uniPosition.amount0
  const amount1 = uniPosition.amount1

  const token0Amount = amount0.toSignificant(token0.decimals)
  const token1Amount = amount1.toSignificant(token1.decimals)

  const sqrtPriceX96JSBI = JSBI.BigInt(result.position.pool.sqrtPriceX96)
  const sqrtRatioLower = TickMath.getSqrtRatioAtTick(result.position.tickLower)
  const sqrtRatioUpper = TickMath.getSqrtRatioAtTick(result.position.tickUpper)
  const isInRange =
    JSBI.greaterThanOrEqual(sqrtPriceX96JSBI, JSBI.BigInt(sqrtRatioLower.toString())) &&
    JSBI.lessThan(sqrtPriceX96JSBI, JSBI.BigInt(sqrtRatioUpper.toString()))

  // Price at tick boundaries (token1 per token0)
  const priceLowerT1PerT0 = tickToPrice(token0, token1, result.position.tickLower)
  const priceUpperT1PerT0 = tickToPrice(token0, token1, result.position.tickUpper)

  // Current price from pool
  const currentPriceT1PerT0 = pool.token0Price // price of token0 in terms of token1
  const currentPriceT0PerT1 = pool.token1Price // price of token1 in terms of token0

  // token1PerToken0 direction (e.g., USDC/WETH = how many USDC per 1 WETH)
  const t1PerT0Lower = priceLowerT1PerT0.toSignificant(6)
  const t1PerT0Upper = priceUpperT1PerT0.toSignificant(6)
  const t1PerT0Current = currentPriceT1PerT0.toSignificant(6)

  // token0PerToken1 direction (e.g., WETH/USDC = how many WETH per 1 USDC)
  const t0PerT1Lower = priceLowerT1PerT0.invert().toSignificant(6)
  const t0PerT1Upper = priceUpperT1PerT0.invert().toSignificant(6)
  const t0PerT1Current = currentPriceT0PerT1.toSignificant(6)

  return Response.json({
    id: result.position.id,
    tickLower: result.position.tickLower,
    tickUpper: result.position.tickUpper,
    liquidity: result.position.liquidity.toString(),
    pool: {
      feeTier: result.position.pool.feeTier,
      currentTick: result.position.pool.currentTick,
      token0: result.position.pool.token0,
      token1: result.position.pool.token1,
    },
    amounts: {
      token0: token0Amount,
      token1: token1Amount,
    },
    range: {
      token0PerToken1: {
        label: `${token0.symbol}/${token1.symbol}`,
        lower: t0PerT1Upper,
        current: t0PerT1Current,
        upper: t0PerT1Lower,
      },
      token1PerToken0: {
        label: `${token1.symbol}/${token0.symbol}`,
        lower: t1PerT0Lower,
        current: t1PerT0Current,
        upper: t1PerT0Upper,
      },
      isInRange,
    },
  });
}
