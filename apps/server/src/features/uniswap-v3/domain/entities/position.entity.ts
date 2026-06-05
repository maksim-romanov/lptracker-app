import { Position } from "@uniswap/v3-sdk";

import type { PoolEntity } from "./pool.entity";

type PositionData = {
  id: string;
  owner: string;
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

  get owner(): string {
    return this.data.owner;
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
}
