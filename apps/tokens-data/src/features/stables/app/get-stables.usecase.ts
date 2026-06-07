import { inject, injectable } from "tsyringe";

import { StablesCache } from "../data/stables.cache";
import { StablesResolver } from "../data/stables.resolver";
import type { TStableEntry } from "../domain/stables-set";
import seed from "../seeds/stables.json";

const FRESH_MS = 6 * 60 * 60 * 1000;
const STALE_MS = 24 * 60 * 60 * 1000;

type TStablesSeed = {
  fetchedAt: string;
  sources: string[];
  stables: TStableEntry[];
};

@injectable()
export class GetStablesUseCase {
  private refreshInFlight: Promise<void> | null = null;

  constructor(
    @inject(StablesCache) private readonly cache: StablesCache,
    @inject(StablesResolver) private readonly resolver: StablesResolver,
  ) {}

  async execute(): Promise<TStableEntry[]> {
    const cached = await this.cache.read().catch(() => undefined);

    if (cached) {
      const age = this.cache.ageMs(cached);
      if (age < FRESH_MS) return cached.entries;
      if (age < STALE_MS) {
        this.kickRefresh();
        return cached.entries;
      }
    }

    this.kickRefresh();
    return (seed as TStablesSeed).stables;
  }

  private kickRefresh(): void {
    if (this.refreshInFlight) return;
    this.refreshInFlight = (async () => {
      try {
        const entries = await this.resolver.resolve();
        await this.cache.write(entries);
      } catch (error) {
        console.error("[stables] background refresh failed:", error);
      } finally {
        this.refreshInFlight = null;
      }
    })();
  }
}
