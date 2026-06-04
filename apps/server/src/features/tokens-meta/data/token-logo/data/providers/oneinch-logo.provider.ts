import { singleton } from "tsyringe";

import type { AsyncLogoProvider } from "../../domain/async-logo-provider";

const TIMEOUT = 3000;

@singleton()
export class OneInchLogo implements AsyncLogoProvider {
  readonly name = "oneinch";

  async resolve(_chainId: number, address: string): Promise<string | null> {
    const url = `https://tokens.1inch.io/${address.toLowerCase()}.png`;
    const res = await this.head(url);
    return res.ok ? url : null;
  }

  protected async head(url: string): Promise<Response> {
    return fetch(url, { method: "HEAD", signal: AbortSignal.timeout(TIMEOUT) });
  }
}
