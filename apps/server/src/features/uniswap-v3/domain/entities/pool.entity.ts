import type { TokenEntity } from "./token.entity";

type PoolData = {
  id: string;
  feeTier: number;
  currentTick: number;
  sqrtPriceX96: string;
  token0: TokenEntity;
  token1: TokenEntity;
};

export class PoolEntity {
  constructor(private readonly data: PoolData) {}

  get id(): string {
    return this.data.id;
  }

  get feeTier(): number {
    return this.data.feeTier;
  }

  get currentTick(): number {
    return this.data.currentTick;
  }

  get sqrtPriceX96(): string {
    return this.data.sqrtPriceX96;
  }

  get token0(): TokenEntity {
    return this.data.token0;
  }

  get token1(): TokenEntity {
    return this.data.token1;
  }
}
