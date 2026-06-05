const gatewayUrl = process.env.EXPO_PUBLIC_API_URL;
if (!gatewayUrl) throw new Error("Missing env: EXPO_PUBLIC_API_URL");

const tokensDataUrl = process.env.EXPO_PUBLIC_TOKENS_DATA_URL ?? (__DEV__ ? "http://localhost:3100" : undefined);
if (!tokensDataUrl) throw new Error("Missing env: EXPO_PUBLIC_TOKENS_DATA_URL");

export const config = {
  api: {
    gateway: { baseUrl: gatewayUrl },
    tokensData: { baseUrl: tokensDataUrl },
  },
};
