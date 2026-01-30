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

  toDomain(chainId: number): TokenEntity {
    return new TokenEntity({
      chainId,
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
  liquidity!: string;

  @Expose()
  @Type(() => GraphQLTokenDto)
  token0!: GraphQLTokenDto;

  @Expose()
  @Type(() => GraphQLTokenDto)
  token1!: GraphQLTokenDto;

  chainId!: number;

  toDomain(): PoolEntity {
    return new PoolEntity({
      chainId: this.chainId,
      id: this.id,
      feeTier: this.feeTier,
      liquidity: this.liquidity,
      currentTick: this.currentTick,
      sqrtPriceX96: this.sqrtPriceX96,
      token0: this.token0.toDomain(this.chainId),
      token1: this.token1.toDomain(this.chainId),
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

  private chainId!: number;

  toDomain(): PositionEntity {
    return new PositionEntity({
      id: this.id,
      tickLower: this.tickLower,
      tickUpper: this.tickUpper,
      liquidity: this.liquidity,
      pool: this.pool.toDomain(),
    });
  }

  static fromGraphQL(raw: unknown, chainId: number): GraphQLPositionDto {
    const dto = plainToInstance(GraphQLPositionDto, raw, {
      excludeExtraneousValues: true,
    });
    dto.chainId = chainId;
    dto.pool.chainId = chainId;
    return dto;
  }
}
