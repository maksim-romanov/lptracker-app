import { env } from "core/config/env";

export const tokensDataUrls = {
  logo: (chainId: number, address: string): string => `${env.tokensDataUrl}/v1/chains/${chainId}/tokens/${address}/logo.png`,
};
