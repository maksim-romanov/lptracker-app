import { Token } from "@uniswap/sdk-core";

type TokenData = {
  chainId: number;
  address: string;
  symbol: string;
  decimals: number;
};

export class TokenEntity {
  constructor(private readonly data: TokenData) {}

  get chainId(): number {
    return this.data.chainId;
  }

  get address(): string {
    return this.data.address;
  }

  get symbol(): string {
    return this.data.symbol;
  }

  get decimals(): number {
    return this.data.decimals;
  }

  get sdk(): Token {
    return new Token(this.chainId, this.address, this.decimals, this.symbol);
  }

  get response() {
    return {
      address: this.address,
      symbol: this.symbol,
      decimals: this.decimals,
    };
  }
}
