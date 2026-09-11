import "reflect-metadata";

import { container } from "tsyringe";

import { PositionsRepository } from "../positions.repository";
import { beforeEach, describe, expect, it } from "bun:test";
import { CHAIN_CONTEXT, GRAPHQL_CLIENT, RPC_CLIENT } from "#features/uniswap-v3/di/tokens";
import { MAX_INDEX_LAG_SECONDS, PositionErrorCode } from "#features/uniswap-v3/domain/errors/position.error";

const nowSeconds = () => Math.floor(Date.now() / 1000);

const repositoryWithResponse = (chainId: number, response: unknown) => {
  container.clearInstances();
  container.register(CHAIN_CONTEXT, { useValue: { chain: { id: chainId } } });
  container.register(GRAPHQL_CLIENT, { useValue: { client: { request: async () => response } } });
  container.register(RPC_CLIENT, { useValue: {} });
  return container.resolve(PositionsRepository);
};

const repositoryWithMeta = (chainId: number, meta: { block: { number: number; timestamp: number }; hasIndexingErrors: boolean }) =>
  repositoryWithResponse(chainId, { positions: [], _meta: meta });

beforeEach(() => {
  container.clearInstances();
});

describe("index freshness", () => {
  it("fails the source when the index is further behind than the threshold", async () => {
    const result = await repositoryWithMeta(42161, {
      block: { number: 292_593_282, timestamp: nowSeconds() - MAX_INDEX_LAG_SECONDS - 1 },
      hasIndexingErrors: false,
    }).getWalletPositions("0xabc");

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().code).toBe(PositionErrorCode.INDEX_STALE);
  });

  it("fails the source when the index reports indexing errors", async () => {
    const result = await repositoryWithMeta(1, {
      block: { number: 1, timestamp: nowSeconds() },
      hasIndexingErrors: true,
    }).getWalletPositions("0xabc");

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().code).toBe(PositionErrorCode.INDEX_UNHEALTHY);
  });

  it("succeeds when the index is fresh", async () => {
    const result = await repositoryWithMeta(1, {
      block: { number: 25_928_051, timestamp: nowSeconds() - 7 },
      hasIndexingErrors: false,
    }).getWalletPositions("0xabc");

    expect(result.isOk()).toBe(true);
  });

  it("fails the source when _meta is missing from the response", async () => {
    const result = await repositoryWithResponse(1, { positions: [] }).getWalletPositions("0xabc");

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().code).toBe(PositionErrorCode.UNEXPECTED_ERROR);
  });

  it("fails the source when _meta.block.timestamp is missing", async () => {
    const result = await repositoryWithResponse(1, {
      positions: [],
      _meta: { block: { number: 1, timestamp: null }, hasIndexingErrors: false },
    }).getWalletPositions("0xabc");

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().code).toBe(PositionErrorCode.UNEXPECTED_ERROR);
  });
});
