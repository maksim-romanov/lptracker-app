import { Token } from "@uniswap/sdk-core";
import { Pool, Position, TickMath, tickToPrice } from "@uniswap/v3-sdk";
import { graphql } from "gql";
import type { WalletPositionsQuery, WalletPositionsQueryVariables } from "gql/graphql";
import JSBI from "jsbi";
import { gqlClient } from "lib/graphql";
import { arbitrum } from "viem/chains";

import { PAGINATION } from "../../../constants";

const getWalletPositionsQuery = graphql(`
  query WalletPositions(
    $owner: Bytes!
    $first: Int!
    $skip: Int!
    $orderBy: Position_orderBy
    $orderDirection: OrderDirection
    $closed: Boolean!
  ) {
    positions(
      where: { owner: $owner, closed: $closed }
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      liquidity
      tickLower
      tickUpper
      pool {
        id
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

interface QueryParams {
  owner: string;
  first: number;
  skip: number;
  closed: boolean;
  orderBy: string;
  orderDirection: "asc" | "desc";
  detail: "basic" | "full";
}

function parseQueryParams(searchParams: URLSearchParams): QueryParams | { error: string; status: number } {
  const owner = searchParams.get("owner");

  if (!owner || !/^0x[a-fA-F0-9]{40}$/.test(owner)) {
    return { error: "Invalid owner address", status: 400 };
  }

  const firstParam = searchParams.get("first");
  const first = firstParam ? Math.min(Math.max(1, parseInt(firstParam)), PAGINATION.MAX_PAGE_SIZE) : PAGINATION.DEFAULT_PAGE_SIZE;

  const skipParam = searchParams.get("skip");
  const skip = skipParam ? Math.max(0, parseInt(skipParam)) : 0;

  const closedParam = searchParams.get("closed");
  const closed = closedParam === null ? false : closedParam === "true";

  const orderBy = searchParams.get("orderBy") || "createdAtTimestamp";

  const orderDirectionParam = searchParams.get("orderDirection") || "desc";
  const orderDirection = orderDirectionParam === "asc" ? "asc" : "desc";

  const detailParam = searchParams.get("detail") || "basic";
  if (!["basic", "full"].includes(detailParam)) {
    return { error: "Invalid detail level. Must be 'basic' or 'full'", status: 400 };
  }
  const detail = detailParam as "basic" | "full";

  return {
    owner,
    first,
    skip,
    closed,
    orderBy,
    orderDirection,
    detail,
  };
}

function enrichPositionWithDetails(position: WalletPositionsQuery["positions"][number]) {
  if (!position.pool) {
    return null;
  }

  const token0 = new Token(
    arbitrum.id,
    position.pool.token0.id,
    position.pool.token0.decimals,
    position.pool.token0.symbol,
    position.pool.token0.symbol,
  );
  const token1 = new Token(
    arbitrum.id,
    position.pool.token1.id,
    position.pool.token1.decimals,
    position.pool.token1.symbol,
    position.pool.token1.symbol,
  );

  const pool = new Pool(
    token0,
    token1,
    position.pool.feeTier,
    position.pool.sqrtPriceX96.toString(),
    position.liquidity.toString(),
    position.pool.currentTick,
  );

  const uniPosition = new Position({
    pool,
    liquidity: position.liquidity.toString(),
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
  });

  const amount0 = uniPosition.amount0;
  const amount1 = uniPosition.amount1;

  const token0Amount = amount0.toSignificant(token0.decimals);
  const token1Amount = amount1.toSignificant(token1.decimals);

  const sqrtPriceX96JSBI = JSBI.BigInt(position.pool.sqrtPriceX96);
  const sqrtRatioLower = TickMath.getSqrtRatioAtTick(position.tickLower);
  const sqrtRatioUpper = TickMath.getSqrtRatioAtTick(position.tickUpper);
  const isInRange =
    JSBI.greaterThanOrEqual(sqrtPriceX96JSBI, JSBI.BigInt(sqrtRatioLower.toString())) &&
    JSBI.lessThan(sqrtPriceX96JSBI, JSBI.BigInt(sqrtRatioUpper.toString()));

  const priceLowerT1PerT0 = tickToPrice(token0, token1, position.tickLower);
  const priceUpperT1PerT0 = tickToPrice(token0, token1, position.tickUpper);

  const currentPriceT1PerT0 = pool.token0Price;
  const currentPriceT0PerT1 = pool.token1Price;

  const t1PerT0Lower = priceLowerT1PerT0.toSignificant(6);
  const t1PerT0Upper = priceUpperT1PerT0.toSignificant(6);
  const t1PerT0Current = currentPriceT1PerT0.toSignificant(6);

  const t0PerT1Lower = priceLowerT1PerT0.invert().toSignificant(6);
  const t0PerT1Upper = priceUpperT1PerT0.invert().toSignificant(6);
  const t0PerT1Current = currentPriceT0PerT1.toSignificant(6);

  return {
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
  };
}

export async function getWalletPositions(owner: string, searchParams: URLSearchParams): Promise<Response> {
  const params = parseQueryParams(searchParams);

  if ("error" in params) {
    return Response.json({ error: params.error }, { status: params.status });
  }

  try {
    const variables: WalletPositionsQueryVariables = {
      owner,
      first: params.first,
      skip: params.skip,
      orderBy: params.orderBy as any,
      orderDirection: params.orderDirection,
      closed: params.closed,
    };

    const result = await gqlClient.request<WalletPositionsQuery, WalletPositionsQueryVariables>(
      getWalletPositionsQuery,
      variables,
    );

    if (!result.positions || result.positions.length === 0) {
      return Response.json({
        owner,
        positions: [],
        pagination: {
          first: params.first,
          skip: params.skip,
          returned: 0,
          hasMore: false,
        },
        filters: {
          closed: params.closed,
          orderBy: params.orderBy,
          orderDirection: params.orderDirection,
        },
      });
    }

    const positions = await Promise.all(
      result.positions.map(async (position) => {
        const basePosition = {
          id: position.id,
          liquidity: position.liquidity.toString(),
          tickLower: position.tickLower,
          tickUpper: position.tickUpper,
          pool: position.pool
            ? {
                id: position.pool.id,
                feeTier: position.pool.feeTier,
                currentTick: position.pool.currentTick,
                sqrtPriceX96: position.pool.sqrtPriceX96,
                token0: {
                  id: position.pool.token0.id,
                  symbol: position.pool.token0.symbol,
                  decimals: position.pool.token0.decimals,
                },
                token1: {
                  id: position.pool.token1.id,
                  symbol: position.pool.token1.symbol,
                  decimals: position.pool.token1.decimals,
                },
              }
            : null,
          links: {
            self: `/api/v1/positions/${position.id}`,
            fees: `/api/v1/positions/${position.id}/fees`,
          },
        };

        if (params.detail === "full") {
          const details = enrichPositionWithDetails(position);
          if (details) {
            return { ...basePosition, ...details };
          }
        }

        return basePosition;
      }),
    );

    return Response.json({
      owner,
      positions,
      pagination: {
        first: params.first,
        skip: params.skip,
        returned: positions.length,
        hasMore: positions.length === params.first,
      },
      filters: {
        closed: params.closed,
        orderBy: params.orderBy,
        orderDirection: params.orderDirection,
      },
    });
  } catch (error) {
    console.error("GraphQL query failed:", error);
    return Response.json(
      {
        error: "Failed to fetch positions",
      },
      { status: 500 },
    );
  }
}
