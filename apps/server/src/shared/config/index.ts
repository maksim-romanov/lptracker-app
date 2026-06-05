const tokensDataUrl = process.env.TOKENS_DATA_URL ?? "http://localhost:3100";

export const config = {
  api: {
    tokensData: { baseUrl: tokensDataUrl },
  },
};
