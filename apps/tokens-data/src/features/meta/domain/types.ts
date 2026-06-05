export interface TokenMeta {
  name: string;
  symbol: string;
  decimals: number;
}

export interface TokenMetaQuery {
  chainId: number;
  address: string;
}

export const metaCacheKey = (chainId: number, address: string) => `${chainId}:${address.toLowerCase()}`;
