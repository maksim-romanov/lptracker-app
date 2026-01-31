import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import NonfungiblePositionManagerABI from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import { err, ok } from "neverthrow";
import { injectable } from "tsyringe";
import type { Address } from "viem";

import type { PositionEntity } from "../domain/entities/position.entity";
import { PositionError } from "../domain/errors/position.error";
import type { PositionFeeRawData } from "../domain/utils/fee-math";
import { BaseRepository } from "./base/base.repository";
import { GraphQLPositionDto } from "./dto/graphql-position.dto";
import { graphql } from "./gql";

type TickData = [bigint, bigint, bigint, bigint, bigint, bigint, bigint, boolean];
type PositionData = [bigint, Address, Address, Address, number, number, number, bigint, bigint, bigint, bigint, bigint];

function parsePositionFeeResult(slice: readonly { result?: unknown }[]): PositionFeeRawData {
  const tickLower = slice[2]?.result as TickData;
  const tickUpper = slice[3]?.result as TickData;
  const position = slice[4]?.result as PositionData;
  return {
    feeGrowthGlobal0X128: slice[0]?.result as bigint,
    feeGrowthGlobal1X128: slice[1]?.result as bigint,
    feeGrowthOutside0LowerX128: tickLower[2],
    feeGrowthOutside1LowerX128: tickLower[3],
    feeGrowthOutside0UpperX128: tickUpper[2],
    feeGrowthOutside1UpperX128: tickUpper[3],
    feeGrowthInside0LastX128: position[8],
    feeGrowthInside1LastX128: position[9],
    tokensOwed0: position[10],
    tokensOwed1: position[11],
    onChainLiquidity: position[7],
  };
}

@injectable()
export class PositionsRepository extends BaseRepository {
  async getWalletPositions(
    owner: string,
    pagination: { first: number; skip: number } = { first: 10, skip: 0 },
    filters: { closed: boolean } = { closed: false },
  ) {
    try {
      const result = await this.gql.request(getWalletPositionsQuery, { owner, ...pagination, ...filters });
      const positions = result.positions.map((p) => GraphQLPositionDto.fromGraphQL(p, this.chainContext.chain.id));
      return ok(positions);
    } catch {
      return err(new PositionError(PositionError.CODE.GRAPHQL_ERROR));
    }
  }

  async getPosition(id: string) {
    try {
      const result = await this.gql.request(getPositionQuery, { id });
      const position = GraphQLPositionDto.fromGraphQL(result.position, this.chainContext.chain.id);
      return ok(position);
    } catch {
      return err(new PositionError(PositionError.CODE.GRAPHQL_ERROR));
    }
  }

  async getPositionFees(position: PositionEntity) {
    try {
      const results = await this.rpc.multicall({ contracts: this.buildFeeContracts(position) });
      return ok(parsePositionFeeResult(results));
    } catch {
      return err(new PositionError(PositionError.CODE.UNEXPECTED_ERROR));
    }
  }

  async getBatchPositionFees(positions: PositionEntity[]) {
    if (positions.length === 0) return ok(new Map<string, PositionFeeRawData>());

    try {
      const contracts = positions.flatMap((p) => this.buildFeeContracts(p));
      const results = await this.rpc.multicall({ contracts: contracts as Parameters<typeof this.rpc.multicall>[0]["contracts"] });

      const feeDataMap = new Map<string, PositionFeeRawData>();
      for (let i = 0; i < positions.length; i++) {
        feeDataMap.set(positions[i]!.id, parsePositionFeeResult(results.slice(i * 5, i * 5 + 5)));
      }
      return ok(feeDataMap);
    } catch {
      return err(new PositionError(PositionError.CODE.UNEXPECTED_ERROR));
    }
  }

  private buildFeeContracts(position: PositionEntity) {
    return [
      { address: position.pool.id, abi: IUniswapV3PoolABI.abi, functionName: "feeGrowthGlobal0X128" },
      { address: position.pool.id, abi: IUniswapV3PoolABI.abi, functionName: "feeGrowthGlobal1X128" },
      { address: position.pool.id, abi: IUniswapV3PoolABI.abi, functionName: "ticks", args: [position.tickLower] },
      { address: position.pool.id, abi: IUniswapV3PoolABI.abi, functionName: "ticks", args: [position.tickUpper] },
      {
        address: this.context.deployments.NonfungiblePositionManager,
        abi: NonfungiblePositionManagerABI.abi,
        functionName: "positions",
        args: [position.id],
      },
    ] as const;
  }
}

const getPositionQuery = graphql(`
  query Position($id: ID!) {
    position(id: $id) {
      id
      liquidity
      tickLower
      tickUpper

      pool {
        id
        feeTier
        liquidity
        currentTick
        sqrtPriceX96
        token0 { id symbol decimals }
        token1 { id symbol decimals }
      }
    }
  }
`);

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
        liquidity
        currentTick
        sqrtPriceX96
        token0 { id symbol decimals }
        token1 { id symbol decimals }
      }
    }
  }
`);
