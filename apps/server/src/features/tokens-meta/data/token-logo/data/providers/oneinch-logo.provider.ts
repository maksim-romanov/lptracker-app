import type { LogoProvider } from "../../domain/logo-provider";

export class OneInchLogo implements LogoProvider {
  constructor(
    _chainId: number,
    private address: string,
  ) {}

  async resolve(): Promise<string | null> {
    return `https://tokens.1inch.io/${this.address.toLowerCase()}.png`;
  }
}
