import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import NonfungiblePositionManagerABI from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import { err, ok } from "neverthrow";
import { injectable } from "tsyringe";
import type { Address } from "viem";

import type { PositionEntity } from "../domain/entities/position.entity";
import { PositionError } from "../domain/errors/position.error";
import { BaseRepository } from "./base/base.repository";
import { GraphQLPositionDto } from "./dto/graphql-position.dto";
import { graphql } from "./gql";

@injectable()
export class PositionsRepository extends BaseRepository {
  async getWalletPositions(
    owner: string,
    pagination: { first: number; skip: number } = { first: 10, skip: 0 },
    filters: { closed: boolean } = { closed: false },
  ) {
    try {
      const result = await this.gql.request(getWalletPositionsQuery, { owner, ...pagination, ...filters });
      const positions = result.positions.map((p) => GraphQLPositionDto.fromGraphQL(p));
      return ok(positions);
    } catch {
      return err(new PositionError(PositionError.CODE.GRAPHQL_ERROR));
    }
  }

  async getPosition(id: string) {
    try {
      const result = await this.gql.request(getPositionQuery, { id });
      const position = GraphQLPositionDto.fromGraphQL(result.position);
      return ok(position);
    } catch {
      return err(new PositionError(PositionError.CODE.GRAPHQL_ERROR));
    }
  }

  async getPositionFees(position: PositionEntity) {
    try {
      const multicallResults = await this.rpc.multicall({
        contracts: [
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
        ],
      });

      type TickData = [bigint, bigint, bigint, bigint, bigint, bigint, bigint, boolean];
      type PositionData = [bigint, Address, Address, Address, number, number, number, bigint, bigint, bigint, bigint, bigint];

      const feeGrowthGlobal0X128 = multicallResults[0].result as bigint;
      const feeGrowthGlobal1X128 = multicallResults[1].result as bigint;
      const tickLowerData = multicallResults[2].result as TickData;
      const tickUpperData = multicallResults[3].result as TickData;
      const positionData = multicallResults[4].result as PositionData;

      return ok({
        feeGrowthGlobal0X128,
        feeGrowthGlobal1X128,
        feeGrowthOutside0LowerX128: tickLowerData[2],
        feeGrowthOutside1LowerX128: tickLowerData[3],
        feeGrowthOutside0UpperX128: tickUpperData[2],
        feeGrowthOutside1UpperX128: tickUpperData[3],
        feeGrowthInside0LastX128: positionData[8],
        feeGrowthInside1LastX128: positionData[9],
        tokensOwed0: positionData[10],
        tokensOwed1: positionData[11],
        onChainLiquidity: positionData[7],
      });
    } catch {
      return err(new PositionError(PositionError.CODE.UNEXPECTED_ERROR));
    }
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
        currentTick
        sqrtPriceX96
        token0 { id symbol decimals }
        token1 { id symbol decimals }
      }
    }
  }
`);
