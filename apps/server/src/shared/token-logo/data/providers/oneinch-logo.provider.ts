import type { LogoProvider } from "../../domain/logo-provider";

export class OneInchLogo implements LogoProvider {
  constructor(
    _chainId: number,
    private address: string,
  ) {}

  get url(): string | null {
    return `https://tokens.1inch.io/${this.address.toLowerCase()}.png`;
  }
}
