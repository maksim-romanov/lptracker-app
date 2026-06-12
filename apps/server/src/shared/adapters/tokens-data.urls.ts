export function buildTokenIconUrl(chainId: number, address: string): string {
  return `/icons/tokens/${chainId}/${address.toLowerCase()}`;
}
