import { getLogger } from "@depthly/logger";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import NonfungiblePositionManagerABI from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import { err, ok } from "neverthrow";
import { injectable } from "tsyringe";
import type { Abi, Address } from "viem";

import type { PositionEntity } from "../domain/entities/position.entity";
import { MAX_INDEX_LAG_SECONDS, PositionError } from "../domain/errors/position.error";
import type { PoolStateRpcData } from "../domain/types/pool-state";
import type { PositionOwedRawData } from "../domain/utils/fee-math";
import { BaseRepository } from "./base/base.repository";
import { GraphQLPositionDto } from "./dto/graphql-position.dto";
import { graphql } from "./gql";

const logger = getLogger(["server", "v3", "repo"]);

const poolAbi = IUniswapV3PoolABI.abi as Abi;
const npmAbi = NonfungiblePositionManagerABI.abi as Abi;

type Slot0Data = [bigint, number, number, number, number, number, boolean];
type TickData = [bigint, bigint, bigint, bigint, bigint, bigint, bigint, boolean];
type PositionData = [bigint, Address, Address, Address, number, number, number, bigint, bigint, bigint, bigint, bigint];

// Returns null when any of the five sub-calls failed. multicall runs with allowFailure, so a
// single reverting call leaves its `result` undefined; indexing into it would throw and take
// every other position's owed balance down with it.
function parsePositionOwedResult(slice: readonly { result?: unknown }[]): PositionOwedRawData | null {
  const feeGrowthGlobal0X128 = slice[0]?.result as bigint | undefined;
  const feeGrowthGlobal1X128 = slice[1]?.result as bigint | undefined;
  const tickLower = slice[2]?.result as TickData | undefined;
  const tickUpper = slice[3]?.result as TickData | undefined;
  const position = slice[4]?.result as PositionData | undefined;
  if (feeGrowthGlobal0X128 === undefined || feeGrowthGlobal1X128 === undefined || !tickLower || !tickUpper || !position) return null;
  return {
    feeGrowthGlobal0X128,
    feeGrowthGlobal1X128,
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
  // `closed` is the subgraph's own flag: burned, or zero liquidity with both tokensOwed zero.
  // A drained position — liquidity withdrawn, balance not yet collected — is deliberately not
  // closed, so the default filter keeps it. That holds only from the subgraph version that
  // indexes tokensOwed onward; an older deployment still collapses drained into closed and
  // hides the balance.
  async getWalletPositions(
    owner: string,
    pagination: { first: number; skip: number } = { first: 10, skip: 0 },
    filters: { closed: boolean } = { closed: false },
  ) {
    const chainId = this.chainContext.chain.id;
    try {
      const result = await this.gql.request(getWalletPositionsQuery, { owner, ...pagination, ...filters });

      const meta = result._meta;
      if (!meta) return err(PositionError.UNEXPECTED_ERROR({ message: "Missing _meta in GraphQL response", context: { chainId, owner } }));
      if (meta.hasIndexingErrors) return err(PositionError.INDEX_UNHEALTHY({ chainId }));

      const timestamp = meta.block.timestamp;
      if (timestamp == null) {
        return err(
          PositionError.UNEXPECTED_ERROR({ message: "Missing _meta.block.timestamp in GraphQL response", context: { chainId, owner } }),
        );
      }
      const lagSeconds = Math.floor(Date.now() / 1000) - timestamp;
      if (lagSeconds > MAX_INDEX_LAG_SECONDS) return err(PositionError.INDEX_STALE({ chainId, lagSeconds }));

      const positions = result.positions.map((p) => GraphQLPositionDto.fromGraphQL(p, chainId));
      logger.info("getWalletPositions", {
        chainId,
        owner,
        closed: filters.closed,
        count: positions.length,
      });
      return ok(positions);
    } catch (error) {
      logger.error("getWalletPositions failed", { chainId, owner, error });
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

  /**
   * Pin one block for a request's chain reads. Pool state and fee growth are read by separate
   * multicalls; if a tick boundary is crossed between them, the branch selected in
   * computeFeeGrowthInside no longer matches the growth values it is applied to, the mod-2^256
   * subtraction wraps, and the result is a fee near 2^128 reported as fact. Every read that
   * feeds one computation must name the same block, which is why `blockNumber` is required
   * rather than optional below.
   */
  async pinBlock() {
    try {
      return ok(await this.rpc.getBlockNumber());
    } catch (error) {
      return err(PositionError.UNEXPECTED_ERROR({ error, context: { chainId: this.chainContext.chain.id } }));
    }
  }

  async getPoolState(poolAddress: Address, blockNumber: bigint) {
    const result = await this.getPoolStates([poolAddress], blockNumber);
    if (result.isErr()) return err(result.error);
    const state = result.value.get(poolAddress);
    if (!state) return err(PositionError.UNEXPECTED_ERROR({ message: "Pool state missing after multicall", context: { poolAddress } }));
    return ok(state);
  }

  async getPoolStates(poolAddresses: Address[], blockNumber: bigint) {
    const unique = [...new Set(poolAddresses)];
    try {
      const contracts = this.buildPoolStateContracts(unique);
      const results = await this.rpc.multicall({ contracts, blockNumber });

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

  async getPositionOwed(position: PositionEntity, blockNumber: bigint) {
    try {
      const results = await this.rpc.multicall({ contracts: this.buildOwedContracts(position), blockNumber });
      const raw = parsePositionOwedResult(results);
      if (!raw) return err(PositionError.UNEXPECTED_ERROR({ message: "Fee call failed or reverted", context: { positionId: position.id } }));
      return ok(raw);
    } catch (error) {
      return err(PositionError.UNEXPECTED_ERROR({ error, context: { positionId: position.id } }));
    }
  }

  async getBatchPositionOwed(positions: PositionEntity[], blockNumber: bigint) {
    if (positions.length === 0) return ok(new Map<string, PositionOwedRawData>());

    try {
      const contracts = positions.flatMap((p) => [...this.buildOwedContracts(p)]);
      const results = await this.rpc.multicall({ contracts, blockNumber });

      const owedDataMap = new Map<string, PositionOwedRawData>();
      const skipped: string[] = [];
      for (const [i, position] of positions.entries()) {
        const raw = parsePositionOwedResult(results.slice(i * 5, i * 5 + 5));
        if (!raw) {
          skipped.push(position.id);
          continue;
        }
        owedDataMap.set(position.id, raw);
      }
      if (skipped.length > 0) {
        logger.warning("getBatchPositionOwed skipped positions", {
          chainId: this.chainContext.chain.id,
          count: skipped.length,
          total: positions.length,
          skipped,
        });
      }
      return ok(owedDataMap);
    } catch (error) {
      logger.error("getBatchPositionOwed failed", {
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

  private buildOwedContracts(position: PositionEntity) {
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
    _meta {
      block {
        number
        timestamp
      }
      hasIndexingErrors
    }
  }
`);
