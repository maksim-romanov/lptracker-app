import { Pool } from "@uniswap/v3-sdk";
import type { Address } from "viem";

import type { TokenEntity } from "./token.entity";

type PoolData = {
  chainId: number;
  id: string;
  feeTier: number;
  liquidity: string;
  currentTick: number;
  sqrtPriceX96: string;
  token0: TokenEntity;
  token1: TokenEntity;
};

export class PoolEntity {
  constructor(private readonly data: PoolData) {}

  get chainId(): number {
    return this.data.chainId;
  }

  get id(): Address {
    return this.data.id as Address;
  }

  get feeTier(): number {
    return this.data.feeTier;
  }

  get liquidity(): string {
    return this.data.liquidity;
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

  get sdk(): Pool {
    return new Pool(this.token0.sdk, this.token1.sdk, this.feeTier, this.sqrtPriceX96, this.liquidity, this.currentTick);
  }

  get response() {
    return {
      id: this.id,
      feeTier: this.feeTier,
      currentTick: this.currentTick,
      sqrtPriceX96: this.sqrtPriceX96,
      token0: this.token0.response,
      token1: this.token1.response,
    };
  }
}
