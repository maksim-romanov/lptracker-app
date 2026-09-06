import { createStore } from "mipd";

export type TEip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

// EIP-6963 discovery, requested at module load so wallets have announced by connect time.
const providerStore = createStore();

// EIP-1193 reserves 4001 for "user rejected the request" — an expected outcome,
// not a fault worth reporting through handleError.
export const isUserRejection = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: unknown }).code === 4001;

export const injectedProvider = (): TEip1193Provider | undefined => {
  const [announced] = providerStore.getProviders();
  if (announced) return announced.provider as TEip1193Provider;
  return (window as { ethereum?: TEip1193Provider }).ethereum;
};
