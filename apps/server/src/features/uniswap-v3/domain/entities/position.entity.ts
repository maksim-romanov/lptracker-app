import { Position } from "@uniswap/v3-sdk";

import type { PoolEntity } from "./pool.entity";

type PositionData = {
  id: string;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  pool: PoolEntity;
};

export class PositionEntity {
  constructor(private readonly data: PositionData) {}

  get id(): string {
    return this.data.id;
  }

  get tickLower(): number {
    return this.data.tickLower;
  }

  get tickUpper(): number {
    return this.data.tickUpper;
  }

  get liquidity(): bigint {
    return BigInt(this.data.liquidity);
  }

  get pool(): PoolEntity {
    return this.data.pool;
  }

  get isActive(): boolean {
    return this.liquidity > 0n;
  }

  get isClosed(): boolean {
    return this.liquidity === 0n;
  }

  get sdk(): Position {
    return new Position({
      pool: this.pool.sdk,
      liquidity: this.liquidity.toString(),
      tickLower: this.tickLower,
      tickUpper: this.tickUpper,
    });
  }

  toResponse(params?: {
    token0PriceUSD: number;
    token1PriceUSD: number;
    unclaimedFees?: { token0: number; token1: number } | null;
  }) {
    const sdk = this.sdk;
    const amount0 = Number(sdk.amount0.toExact());
    const amount1 = Number(sdk.amount1.toExact());

    const token0PriceUSD = params?.token0PriceUSD ?? 0;
    const token1PriceUSD = params?.token1PriceUSD ?? 0;
    const fees = params?.unclaimedFees;

    return {
      id: this.id,
      tickLower: this.tickLower,
      tickUpper: this.tickUpper,
      liquidity: {
        token0: { value: amount0, USDValue: amount0 * token0PriceUSD },
        token1: { value: amount1, USDValue: amount1 * token1PriceUSD },
      },
      unclaimedFees: fees
        ? {
            token0: { value: fees.token0, USDValue: fees.token0 * token0PriceUSD },
            token1: { value: fees.token1, USDValue: fees.token1 * token1PriceUSD },
          }
        : fees ?? null,
      pool: this.pool.response,
      isActive: this.isActive,
      isClosed: this.isClosed,
    };
  }
}
