import "reflect-metadata";

import { container } from "tsyringe";

import { PositionsRepository } from "../positions.repository";
import { beforeEach, describe, expect, it } from "bun:test";
import { CHAIN_CONTEXT, GRAPHQL_CLIENT, RPC_CLIENT } from "#features/uniswap-v3/di/tokens";
import type { PositionEntity } from "#features/uniswap-v3/domain/entities/position.entity";

const POOL = "0x1111111111111111111111111111111111111111";
const MANAGER = "0x2222222222222222222222222222222222222222";
const PINNED_BLOCK = 21_000_000n;

const tickResult = () => [0n, 0n, 7n, 8n, 0n, 0n, 0n, true];
const positionResult = () => [0n, MANAGER, POOL, POOL, 0, -100, 100, 500n, 1n, 2n, 3n, 4n];

const feeCallsFor = (count: number) =>
  Array.from({ length: count }, () => [
    { result: 10n },
    { result: 20n },
    { result: tickResult() },
    { result: tickResult() },
    { result: positionResult() },
  ]).flat();

const entity = (id: string) => ({ id, tickLower: -100, tickUpper: 100, pool: { id: POOL } }) as unknown as PositionEntity;

interface MulticallArgs {
  readonly contracts: readonly unknown[];
  readonly blockNumber?: bigint;
}

const repositoryWith = (multicall: (args: MulticallArgs) => Promise<unknown[]>, calls: MulticallArgs[]) => {
  container.clearInstances();
  container.register(CHAIN_CONTEXT, {
    useValue: { chain: { id: 1 }, deployments: { NonfungiblePositionManager: MANAGER } },
  });
  container.register(GRAPHQL_CLIENT, { useValue: { client: { request: async () => ({}) } } });
  container.register(RPC_CLIENT, {
    useValue: {
      client: {
        getBlockNumber: async () => PINNED_BLOCK,
        multicall: async (args: MulticallArgs) => {
          calls.push(args);
          return multicall(args);
        },
      },
    },
  });
  return container.resolve(PositionsRepository);
};

beforeEach(() => {
  container.clearInstances();
});

describe("pinned chain reads", () => {
  it("reads pool state at the pinned block rather than at head", async () => {
    const calls: MulticallArgs[] = [];
    const repository = repositoryWith(async () => [{ result: [1n, 5, 0, 0, 0, 0, true] }, { result: 99n }], calls);

    const result = await repository.getPoolStates([POOL], PINNED_BLOCK);

    expect(result.isOk()).toBe(true);
    expect(calls[0]?.blockNumber).toBe(PINNED_BLOCK);
  });

  it("reads fee growth at the same pinned block, so the tick branch matches the growth it is applied to", async () => {
    const calls: MulticallArgs[] = [];
    const repository = repositoryWith(async () => feeCallsFor(1), calls);

    await repository.getBatchPositionOwed([entity("1")], PINNED_BLOCK);

    expect(calls[0]?.blockNumber).toBe(PINNED_BLOCK);
  });
});

describe("a failed fee sub-call", () => {
  it("drops only its own position, leaving the rest of the wallet's fees intact", async () => {
    const calls: MulticallArgs[] = [];
    // The third sub-call of the first position reverted: multicall reports it with no `result`.
    const results: { result?: unknown }[] = feeCallsFor(2);
    results[2] = {};
    const repository = repositoryWith(async () => results, calls);

    const result = await repository.getBatchPositionOwed([entity("1"), entity("2")], PINNED_BLOCK);

    expect(result.isOk()).toBe(true);
    const fees = result._unsafeUnwrap();
    expect(fees.has("1")).toBe(false);
    expect(fees.has("2")).toBe(true);
  });

  it("fails the single-position read loudly instead of returning a half-built record", async () => {
    const calls: MulticallArgs[] = [];
    const results: { result?: unknown }[] = feeCallsFor(1);
    results[4] = {};
    const repository = repositoryWith(async () => results, calls);

    const result = await repository.getPositionOwed(entity("1"), PINNED_BLOCK);

    expect(result.isErr()).toBe(true);
  });
});
