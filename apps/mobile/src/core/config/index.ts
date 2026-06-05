const apiUrl = process.env.EXPO_PUBLIC_API_URL;
if (!apiUrl) throw new Error("Missing env: EXPO_PUBLIC_API_URL");

const tokensDataUrl = process.env.EXPO_PUBLIC_TOKENS_DATA_URL ?? (__DEV__ ? "http://localhost:3100" : undefined);
if (!tokensDataUrl) throw new Error("Missing env: EXPO_PUBLIC_TOKENS_DATA_URL");

export const config = {
  apiUrl,
  tokensDataUrl,
};
