import { getLogger } from "@mars-909/logger";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import NonfungiblePositionManagerABI from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import { err, ok } from "neverthrow";
import { injectable } from "tsyringe";
import type { Abi, Address } from "viem";

import type { PositionEntity } from "../domain/entities/position.entity";
import { PositionError } from "../domain/errors/position.error";
import type { PoolStateRpcData } from "../domain/types/pool-state";
import type { PositionFeeRawData } from "../domain/utils/fee-math";
import { BaseRepository } from "./base/base.repository";
import { GraphQLPositionDto } from "./dto/graphql-position.dto";
import { graphql } from "./gql";

const logger = getLogger(["server", "v3", "repo"]);

const poolAbi = IUniswapV3PoolABI.abi as Abi;
const npmAbi = NonfungiblePositionManagerABI.abi as Abi;

type Slot0Data = [bigint, number, number, number, number, number, boolean];
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
      logger.info("getWalletPositions", {
        chainId: this.chainContext.chain.id,
        owner,
        closed: filters.closed,
        count: positions.length,
      });
      return ok(positions);
    } catch (error) {
      logger.error("getWalletPositions failed", {
        chainId: this.chainContext.chain.id,
        owner,
        error,
      });
      return err(PositionError.GRAPHQL_ERROR({ error, context: { owner, ...pagination } }));
    }
  }

  async getPosition(id: string) {
    try {
      const result = await this.gql.request(getPositionQuery, { id });
      if (!result.position) return err(PositionError.POSITION_NOT_FOUND({ context: { id } }));
      const position = GraphQLPositionDto.fromGraphQL(result.position, this.chainContext.chain.id);
      return ok(position);
    } catch (error) {
      return err(PositionError.GRAPHQL_ERROR({ error, context: { id } }));
    }
  }

  async getPoolState(poolAddress: Address) {
    const result = await this.getPoolStates([poolAddress]);
    if (result.isErr()) return err(result.error);
    const state = result.value.get(poolAddress);
    if (!state) return err(PositionError.UNEXPECTED_ERROR({ message: "Pool state missing after multicall", context: { poolAddress } }));
    return ok(state);
  }

  async getPoolStates(poolAddresses: Address[]) {
    const unique = [...new Set(poolAddresses)];
    try {
      const contracts = this.buildPoolStateContracts(unique);
      const results = await this.rpc.multicall({ contracts });

      const map = new Map<Address, PoolStateRpcData>();
      const skipped: { address: Address; reason: string }[] = [];
      for (let i = 0; i < unique.length; i++) {
        const address = unique[i];
        if (!address) continue;
        const slot0 = results[i * 2]?.result as Slot0Data | undefined;
        const liquidity = results[i * 2 + 1]?.result as bigint | undefined;
        if (!slot0 || liquidity === undefined) {
          skipped.push({ address, reason: !slot0 ? "slot0 call failed/reverted" : "liquidity call failed/reverted" });
          continue;
        }
        map.set(address, { sqrtPriceX96: slot0[0], currentTick: slot0[1], liquidity });
      }
      if (skipped.length > 0) {
        logger.warning("getPoolStates skipped pools", {
          chainId: this.chainContext.chain.id,
          count: skipped.length,
          total: unique.length,
          skipped,
        });
      }
      return ok(map);
    } catch (error) {
      logger.error("getPoolStates failed", {
        chainId: this.chainContext.chain.id,
        count: unique.length,
        error,
      });
      return err(PositionError.UNEXPECTED_ERROR({ error, context: { poolAddresses: unique } }));
    }
  }

  async getPositionFees(position: PositionEntity) {
    try {
      const results = await this.rpc.multicall({ contracts: this.buildFeeContracts(position) });
      return ok(parsePositionFeeResult(results));
    } catch (error) {
      return err(PositionError.UNEXPECTED_ERROR({ error, context: { positionId: position.id } }));
    }
  }

  async getBatchPositionFees(positions: PositionEntity[]) {
    if (positions.length === 0) return ok(new Map<string, PositionFeeRawData>());

    try {
      const contracts = positions.flatMap((p) => [...this.buildFeeContracts(p)]);
      const results = await this.rpc.multicall({ contracts });

      const feeDataMap = new Map<string, PositionFeeRawData>();
      for (let i = 0; i < positions.length; i++) {
        feeDataMap.set(positions[i]!.id, parsePositionFeeResult(results.slice(i * 5, i * 5 + 5)));
      }
      return ok(feeDataMap);
    } catch (error) {
      logger.error("getBatchPositionFees failed", {
        chainId: this.chainContext.chain.id,
        count: positions.length,
        error,
      });
      return err(PositionError.UNEXPECTED_ERROR({ error, context: { positionCount: positions.length } }));
    }
  }

  private buildPoolStateContracts(addresses: Address[]) {
    return addresses.flatMap((address) => [
      { address, abi: poolAbi, functionName: "slot0" },
      { address, abi: poolAbi, functionName: "liquidity" },
    ]);
  }

  private buildFeeContracts(position: PositionEntity) {
    return [
      { address: position.pool.id, abi: poolAbi, functionName: "feeGrowthGlobal0X128" },
      { address: position.pool.id, abi: poolAbi, functionName: "feeGrowthGlobal1X128" },
      { address: position.pool.id, abi: poolAbi, functionName: "ticks", args: [position.tickLower] },
      { address: position.pool.id, abi: poolAbi, functionName: "ticks", args: [position.tickUpper] },
      {
        address: this.context.deployments.NonfungiblePositionManager,
        abi: npmAbi,
        functionName: "positions",
        args: [position.id],
      },
    ];
  }
}

const getPositionQuery = graphql(`
  query Position($id: ID!) {
    position(id: $id) {
      id
      owner
      liquidity
      tickLower
      tickUpper
      createdAtTimestamp
      updatedAtTimestamp

      pool {
        id
        feeTier
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
      owner
      liquidity
      tickLower
      tickUpper
      createdAtTimestamp
      updatedAtTimestamp
      pool {
        id
        feeTier
        token0 { id symbol decimals }
        token1 { id symbol decimals }
      }
    }
  }
`);
