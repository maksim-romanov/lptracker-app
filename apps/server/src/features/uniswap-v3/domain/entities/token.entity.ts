type TokenData = {
  address: string;
  symbol: string;
  decimals: number;
};

export class TokenEntity {
  constructor(private readonly data: TokenData) {}

  get address(): string {
    return this.data.address;
  }

  get symbol(): string {
    return this.data.symbol;
  }

  get decimals(): number {
    return this.data.decimals;
  }

  toResponse() {
    return {
      address: this.address,
      symbol: this.symbol,
      decimals: this.decimals,
    };
  }
}
