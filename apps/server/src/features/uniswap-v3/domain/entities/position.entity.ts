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

  toResponse(prices?: { token0PriceUSD: number; token1PriceUSD: number }) {
    const sdk = this.sdk;
    const amount0 = Number(sdk.amount0.toExact());
    const amount1 = Number(sdk.amount1.toExact());

    return {
      id: this.id,
      tickLower: this.tickLower,
      tickUpper: this.tickUpper,
      liquidity: {
        token0: { value: amount0, USDValue: amount0 * (prices?.token0PriceUSD ?? 0) },
        token1: { value: amount1, USDValue: amount1 * (prices?.token1PriceUSD ?? 0) },
      },
      pool: this.pool.response,
      isActive: this.isActive,
      isClosed: this.isClosed,
    };
  }
}
