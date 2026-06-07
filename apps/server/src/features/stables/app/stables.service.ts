import { inject, singleton } from "tsyringe";

import { StablesTokensDataClient } from "../data/stables-tokens-data.client";

const REFRESH_INTERVAL_MS = 30 * 60 * 1000;

@singleton()
export class StablesService {
  private cache = new Set<string>();
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(@inject(StablesTokensDataClient) private readonly client: StablesTokensDataClient) {}

  async hydrate(): Promise<void> {
    await this.refresh();
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.refresh().catch((error) => {
        console.warn("[stables] background refresh threw:", error);
      });
    }, REFRESH_INTERVAL_MS);
    this.timer.unref?.();
  }

  isStable(chainId: number, address: string): boolean {
    return this.cache.has(this.key(chainId, address));
  }

  private async refresh(): Promise<void> {
    const result = await this.client.getStables();
    if (result.isErr()) {
      console.warn("[stables] refresh failed; keeping current cache", { code: result.error.code, message: result.error.message });
      return;
    }
    const next = new Set<string>();
    for (const entry of result.value) {
      next.add(this.key(entry.chainId, entry.address));
    }
    this.cache = next;
  }

  private key(chainId: number, address: string): string {
    return `${chainId}:${address.toLowerCase()}`;
  }
}
