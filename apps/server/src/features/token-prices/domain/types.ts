export interface TokenPriceQuery {
  chainId: number;
  address: string;
}

export interface TokenPrice {
  priceUSD: number;
  confidence: number;
}

export const cacheKey = (chainId: number, address: string) =>
  `${chainId}:${address.toLowerCase()}`;
