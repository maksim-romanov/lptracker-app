import pLimit from "p-limit";
import { BaseExternalProvider, type ExternalProviderConfig } from "shared/providers/base-external-provider";
import { singleton } from "tsyringe";

import type { AsyncStablesProvider } from "../../domain/async-stables-provider";
import { dedupeStables, type TStableEntry } from "../../domain/stables-set";

type LlamaStablecoinSummary = {
  id: string;
  symbol?: string;
};

type LlamaStablecoinDetail = {
  symbol?: string;
  address?: string | null;
};

const DETAIL_CONCURRENCY = 5;

@singleton()
export class DefiLlamaStablesProvider extends BaseExternalProvider<void, TStableEntry[]> implements AsyncStablesProvider {
  readonly name = "defillama";
  readonly config: ExternalProviderConfig = {
    name: "defillama-stables",
    timeout: 8000,
    rateLimiter: { points: 100, duration: 60, execEvenly: true, execEvenlyMinDelayMs: 600 },
    circuitBreaker: { timeout: 180_000, errorThresholdPercentage: 50, resetTimeout: 30_000, volumeThreshold: 3 },
  };

  async resolve(): Promise<TStableEntry[]> {
    return this.execute();
  }

  protected async fetch(): Promise<TStableEntry[]> {
    const summary = await this.fetchSummary();
    if (summary.length === 0) return [];

    const limit = pLimit(DETAIL_CONCURRENCY);
    const details = await Promise.all(summary.map((stable) => limit(() => this.fetchDetailSafe(stable.id))));

    const entries: TStableEntry[] = [];
    for (const [i, detail] of details.entries()) {
      if (!detail) continue;
      const summarySymbol = summary[i]?.symbol;
      const symbol = (detail.symbol ?? summarySymbol ?? "").toUpperCase();
      const address = detail.address?.toLowerCase();
      if (!symbol || !address) continue;
      if (!address.startsWith("0x") || address.length !== 42) continue;
      entries.push({ chainId: 1, address, symbol });
    }

    return dedupeStables(entries);
  }

  protected async fetchSummary(): Promise<LlamaStablecoinSummary[]> {
    const url = "https://stablecoins.llama.fi/stablecoins?includePrices=false";
    const res = await this.doFetch(url);
    if (!res.ok) throw new Error(`DefiLlama stablecoins API error: ${res.status}`);
    const data = (await res.json()) as { peggedAssets?: LlamaStablecoinSummary[] };
    return data.peggedAssets ?? [];
  }

  protected async fetchDetailSafe(id: string): Promise<LlamaStablecoinDetail | null> {
    try {
      const url = `https://stablecoins.llama.fi/stablecoin/${encodeURIComponent(id)}`;
      const res = await this.doFetch(url);
      if (!res.ok) return null;
      return (await res.json()) as LlamaStablecoinDetail;
    } catch {
      return null;
    }
  }

  protected async doFetch(url: string): Promise<Response> {
    return fetch(url, { signal: AbortSignal.timeout(this.config.timeout) });
  }
}
