import { config } from "shared/config";

export function buildTokenIconUrl(chainId: number, address: string): string {
  return `${config.api.tokensData.baseUrl}/v1/chains/${chainId}/tokens/${address.toLowerCase()}/logo.png`;
}

export function buildNetworkIconUrl(chainId: number): string {
  return `${config.api.tokensData.baseUrl}/v1/chains/${chainId}/icon.png`;
}
