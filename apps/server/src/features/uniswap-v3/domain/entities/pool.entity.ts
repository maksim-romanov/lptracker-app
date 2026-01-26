import type { Address } from "viem";

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

  get id(): Address {
    return this.data.id as Address;
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

  toResponse() {
    return {
      id: this.id,
      feeTier: this.feeTier,
      currentTick: this.currentTick,
      sqrtPriceX96: this.sqrtPriceX96,
      token0: this.token0.toResponse(),
      token1: this.token1.toResponse(),
    };
  }
}
