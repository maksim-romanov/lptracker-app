// bun test forces NODE_ENV=test, which Bun's env-loading skips .env.local for.
// Give core/config a value so importing it doesn't throw when no secrets are present.
process.env.EXPO_PUBLIC_API_URL ??= "http://localhost:3000";
