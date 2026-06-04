import type { ILogoProvider, TLogoResult } from "../../domain/logo-provider";

export class OneInchLogo implements ILogoProvider {
  constructor(
    _chainId: number,
    private address: string,
  ) {}

  async resolve(): Promise<TLogoResult | null> {
    return {
      url: `https://tokens.1inch.io/${this.address.toLowerCase()}.png`,
      verified: false,
    };
  }
}
