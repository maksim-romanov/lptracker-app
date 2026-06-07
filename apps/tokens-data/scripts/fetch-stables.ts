import "reflect-metadata";

import { CoinGeckoStablesProvider } from "../src/features/stables/data/providers/coingecko-stables.provider";
import { DefiLlamaStablesProvider } from "../src/features/stables/data/providers/defillama-stables.provider";
import { dedupeStables, sortStables, type TStableEntry } from "../src/features/stables/domain/stables-set";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const OUTPUT_PATH = join(import.meta.dir, "..", "src", "features", "stables", "seeds", "stables.json");

type ProviderResult = {
  name: string;
  ok: boolean;
  entries: TStableEntry[];
  error?: string;
};

async function runProvider(provider: { name: string; resolve(): Promise<TStableEntry[]> }): Promise<ProviderResult> {
  try {
    const entries = await provider.resolve();
    return { name: provider.name, ok: true, entries };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { name: provider.name, ok: false, entries: [], error: message };
  }
}

async function main(): Promise<void> {
  const coingecko = new CoinGeckoStablesProvider();
  const defillama = new DefiLlamaStablesProvider();

  const results = await Promise.all([runProvider(coingecko), runProvider(defillama)]);

  for (const result of results) {
    if (result.ok) {
      console.log(`[${result.name}] fetched ${result.entries.length} entries`);
    } else {
      console.warn(`[${result.name}] FAILED: ${result.error}`);
    }
  }

  const successes = results.filter((r) => r.ok);
  if (successes.length === 0) {
    console.error("All providers failed; refusing to write empty seed.");
    process.exit(1);
  }

  const merged = sortStables(dedupeStables(successes.flatMap((r) => r.entries)));
  console.log(`Merged total after dedupe: ${merged.length} entries`);

  const payload = {
    fetchedAt: new Date().toISOString(),
    sources: successes.map((r) => r.name),
    stables: merged,
  };

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error("fetch-stables crashed:", error);
  process.exit(1);
});
