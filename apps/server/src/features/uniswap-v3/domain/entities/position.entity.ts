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

  // Simple getters (Thin Entity pattern)
  get isActive(): boolean {
    return this.liquidity > 0n;
  }

  get isClosed(): boolean {
    return this.liquidity === 0n;
  }
}
