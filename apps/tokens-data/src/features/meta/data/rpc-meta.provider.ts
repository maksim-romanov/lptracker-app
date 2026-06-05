import { singleton } from "tsyringe";
import { type Address, createPublicClient, erc20Abi, http, type PublicClient } from "viem";

import { BaseExternalProvider, type ExternalProviderConfig } from "shared/providers/base-external-provider";

import type { TokenMeta, TokenMetaQuery } from "../domain/types";
import { metaCacheKey } from "../domain/types";

@singleton()
export class RpcMetaProvider extends BaseExternalProvider<TokenMetaQuery[], Map<string, TokenMeta>> {
  readonly config: ExternalProviderConfig = {
    name: "rpc-meta",
    timeout: 8000,
    rateLimiter: { points: 50, duration: 1, execEvenly: false, execEvenlyMinDelayMs: 0 },
    circuitBreaker: { timeout: 8000, errorThresholdPercentage: 50, resetTimeout: 10_000, volumeThreshold: 5 },
  };

  private readonly clients = new Map<number, PublicClient>();

  protected async fetch(queries: TokenMetaQuery[]): Promise<Map<string, TokenMeta>> {
    const byChain = new Map<number, string[]>();
    for (const q of queries) {
      const group = byChain.get(q.chainId) ?? [];
      group.push(q.address);
      byChain.set(q.chainId, group);
    }

    const result = new Map<string, TokenMeta>();
    const perChain = await Promise.all(
      Array.from(byChain.entries()).map(async ([chainId, addresses]) => {
        const slots = await this.multicall(chainId, addresses);
        return { chainId, addresses, slots };
      }),
    );

    for (const { chainId, addresses, slots } of perChain) {
      for (let i = 0; i < addresses.length; i++) {
        const meta = slots[i];
        const address = addresses[i];
        if (meta == null || address == null) continue;
        result.set(metaCacheKey(chainId, address), meta);
      }
    }

    return result;
  }

  protected async multicall(chainId: number, addresses: string[]): Promise<Array<TokenMeta | null>> {
    const client = this.getClient(chainId);
    const calls = addresses.flatMap((address) => [
      { address: address as Address, abi: erc20Abi, functionName: "name" as const },
      { address: address as Address, abi: erc20Abi, functionName: "symbol" as const },
      { address: address as Address, abi: erc20Abi, functionName: "decimals" as const },
    ]);
    const results = await client.multicall({ contracts: calls, allowFailure: true });

    const out: Array<TokenMeta | null> = [];
    for (let i = 0; i < addresses.length; i++) {
      const nameRes = results[i * 3];
      const symbolRes = results[i * 3 + 1];
      const decimalsRes = results[i * 3 + 2];
      if (
        nameRes?.status !== "success" ||
        symbolRes?.status !== "success" ||
        decimalsRes?.status !== "success" ||
        typeof nameRes.result !== "string" ||
        typeof symbolRes.result !== "string" ||
        typeof decimalsRes.result !== "number"
      ) {
        out.push(null);
        continue;
      }
      out.push({ name: nameRes.result, symbol: symbolRes.result, decimals: decimalsRes.result });
    }
    return out;
  }

  private getClient(chainId: number): PublicClient {
    const existing = this.clients.get(chainId);
    if (existing) return existing;
    const rpcUrl = process.env[`RPC_URL_${chainId}`];
    if (!rpcUrl) throw new Error(`No RPC URL configured for chain ${chainId} (set RPC_URL_${chainId})`);
    const client = createPublicClient({ transport: http(rpcUrl) }) as PublicClient;
    this.clients.set(chainId, client);
    return client;
  }
}
