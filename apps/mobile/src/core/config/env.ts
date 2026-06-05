const requireEnv = (key: string): string => {
  const v = process.env[key];
  if (v && v.length > 0) return v;
  throw new Error(`Missing env: ${key}`);
};

const devDefault = (key: string, fallback: string): string => {
  const v = process.env[key];
  if (v && v.length > 0) return v;
  if (__DEV__) return fallback;
  throw new Error(`Missing env: ${key} (no dev default in production)`);
};

type Env = {
  apiUrl: string;
  tokensDataUrl: string;
};

export const env: Env = {
  apiUrl: requireEnv("EXPO_PUBLIC_API_URL"),
  tokensDataUrl: devDefault("EXPO_PUBLIC_TOKENS_DATA_URL", "http://localhost:3100"),
};
