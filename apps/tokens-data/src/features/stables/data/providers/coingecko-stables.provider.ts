import { BaseExternalProvider, type ExternalProviderConfig } from "shared/providers/base-external-provider";
import { singleton } from "tsyringe";

import type { AsyncStablesProvider } from "../../domain/async-stables-provider";
import { coingeckoChainToChainId } from "../../domain/chain-name-mapping";
import { dedupeStables, type TStableEntry } from "../../domain/stables-set";

type CoinGeckoListed = {
  id: string;
  symbol?: string;
  platforms?: Record<string, string | null | undefined>;
};

type CoinGeckoMarket = {
  id?: string;
};

const PER_PAGE = 250;
const MAX_PAGES = 4;

@singleton()
export class CoinGeckoStablesProvider extends BaseExternalProvider<void, TStableEntry[]> implements AsyncStablesProvider {
  readonly name = "coingecko";
  readonly config: ExternalProviderConfig = {
    name: "coingecko-stables",
    timeout: 15_000,
    rateLimiter: { points: 10, duration: 60, execEvenly: true, execEvenlyMinDelayMs: 6000 },
    circuitBreaker: { timeout: 20_000, errorThresholdPercentage: 50, resetTimeout: 60_000, volumeThreshold: 3 },
  };

  async resolve(): Promise<TStableEntry[]> {
    return this.execute();
  }

  protected async fetch(): Promise<TStableEntry[]> {
    const stableIds = await this.fetchStableIds();
    if (stableIds.size === 0) return [];

    const listed = await this.fetchListedCoinsWithPlatforms();

    const entries: TStableEntry[] = [];
    for (const coin of listed) {
      if (!stableIds.has(coin.id)) continue;
      const symbol = coin.symbol?.toUpperCase();
      if (!symbol || !coin.platforms) continue;
      for (const [platform, addressRaw] of Object.entries(coin.platforms)) {
        if (!addressRaw) continue;
        const chainId = coingeckoChainToChainId(platform);
        if (chainId === null) continue;
        const address = addressRaw.toLowerCase();
        if (!address.startsWith("0x") || address.length !== 42) continue;
        entries.push({ chainId, address, symbol });
      }
    }

    return dedupeStables(entries);
  }

  protected async fetchStableIds(): Promise<Set<string>> {
    const ids = new Set<string>();
    for (let page = 1; page <= MAX_PAGES; page++) {
      const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=stablecoins&per_page=${PER_PAGE}&page=${page}&sparkline=false`;
      const res = await this.doFetch(url);
      if (!res.ok) throw new Error(`CoinGecko markets API error: ${res.status}`);
      const data = (await res.json()) as CoinGeckoMarket[];
      for (const m of data) if (m.id) ids.add(m.id);
      if (data.length < PER_PAGE) break;
    }
    return ids;
  }

  protected async fetchListedCoinsWithPlatforms(): Promise<CoinGeckoListed[]> {
    const url = "https://api.coingecko.com/api/v3/coins/list?include_platform=true";
    const res = await this.doFetch(url);
    if (!res.ok) throw new Error(`CoinGecko list API error: ${res.status}`);
    return (await res.json()) as CoinGeckoListed[];
  }

  protected async doFetch(url: string): Promise<Response> {
    return fetch(url, { signal: AbortSignal.timeout(this.config.timeout) });
  }
}
