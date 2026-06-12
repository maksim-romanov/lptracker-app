import { config } from "core/config";

export const tokensDataUrls = {
  logo: (chainId: number, address: string): string => `${config.api.gateway.baseUrl}/icons/tokens/${chainId}/${address.toLowerCase()}`,
  resolve: (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    if (/^https?:\/\//.test(url)) return url;
    if (url.startsWith("/")) return `${config.api.gateway.baseUrl}${url}`;
    return url;
  },
};
