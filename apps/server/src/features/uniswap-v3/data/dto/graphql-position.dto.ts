import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import type { Address } from "viem";

import { PoolEntity } from "../../domain/entities/pool.entity";
import { PositionEntity } from "../../domain/entities/position.entity";
import { TokenEntity } from "../../domain/entities/token.entity";

export class GraphQLTokenDto {
  @Expose()
  id!: string;

  @Expose()
  symbol!: string;

  @Expose()
  decimals!: number;

  toDomain(): TokenEntity {
    return new TokenEntity({
      address: this.id,
      symbol: this.symbol,
      decimals: this.decimals,
    });
  }
}

export class GraphQLPoolDto {
  @Expose()
  id!: Address;

  @Expose()
  feeTier!: number;

  @Expose()
  currentTick!: number;

  @Expose()
  sqrtPriceX96!: string;

  @Expose()
  @Type(() => GraphQLTokenDto)
  token0!: GraphQLTokenDto;

  @Expose()
  @Type(() => GraphQLTokenDto)
  token1!: GraphQLTokenDto;

  toDomain(): PoolEntity {
    return new PoolEntity({
      id: this.id,
      feeTier: this.feeTier,
      currentTick: this.currentTick,
      sqrtPriceX96: this.sqrtPriceX96,
      token0: this.token0.toDomain(),
      token1: this.token1.toDomain(),
    });
  }
}

export class GraphQLPositionDto {
  @Expose()
  id!: string;

  @Expose()
  tickLower!: number;

  @Expose()
  tickUpper!: number;

  @Expose()
  @Transform(({ obj }) => obj.liquidity.toString())
  liquidity!: string;

  @Expose()
  @Type(() => GraphQLPoolDto)
  pool!: GraphQLPoolDto;

  toDomain(): PositionEntity {
    return new PositionEntity({
      id: this.id,
      tickLower: this.tickLower,
      tickUpper: this.tickUpper,
      liquidity: this.liquidity,
      pool: this.pool.toDomain(),
    });
  }

  static fromGraphQL(raw: any): GraphQLPositionDto {
    return plainToInstance(GraphQLPositionDto, raw, {
      excludeExtraneousValues: true,
    });
  }
}
