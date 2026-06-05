import { config } from "core/config";

export const tokensDataUrls = {
  logo: (chainId: number, address: string): string => `${config.api.tokensData.baseUrl}/v1/chains/${chainId}/tokens/${address}/logo.png`,
};
