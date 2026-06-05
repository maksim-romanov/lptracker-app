import { config } from "core/config";

export const tokensDataUrls = {
  logo: (chainId: number, address: string): string => `${config.tokensDataUrl}/v1/chains/${chainId}/tokens/${address}/logo.png`,
};
