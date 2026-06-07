import { inject, singleton } from "tsyringe";

import type { AsyncStablesProvider } from "../domain/async-stables-provider";
import { dedupeStables, sortStables, type TStableEntry } from "../domain/stables-set";
import { CoinGeckoStablesProvider } from "./providers/coingecko-stables.provider";
import { DefiLlamaStablesProvider } from "./providers/defillama-stables.provider";

@singleton()
export class StablesResolver {
  private readonly providers: AsyncStablesProvider[];

  constructor(
    @inject(CoinGeckoStablesProvider) coingecko: CoinGeckoStablesProvider,
    @inject(DefiLlamaStablesProvider) defillama: DefiLlamaStablesProvider,
  ) {
    this.providers = [coingecko, defillama];
  }

  async resolve(): Promise<TStableEntry[]> {
    const settled = await Promise.allSettled(this.providers.map((p) => p.resolve()));

    const merged: TStableEntry[] = [];
    let succeeded = 0;
    for (const result of settled) {
      if (result.status === "fulfilled") {
        merged.push(...result.value);
        succeeded++;
      }
    }

    if (succeeded === 0) throw new Error("All stables providers failed");

    return sortStables(dedupeStables(merged));
  }
}
