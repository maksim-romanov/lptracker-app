import { NETWORKS } from "@mars-909/catalog";
import { buildNetworkIconUrl } from "shared/adapters/tokens-data.urls";
import type { Network } from "shared/contracts";

export const networkCatalog: Network[] = NETWORKS.map((seed) => ({
  ...seed,
  iconUrl: buildNetworkIconUrl(seed.chainId),
}));

const byChainId = new Map<number, Network>(networkCatalog.map((n) => [n.chainId, n]));

export const isKnownChainId = (chainId: number): boolean => byChainId.has(chainId);
export const knownChainIds = (): number[] => [...byChainId.keys()];
export const networkByChainId = (chainId: number): Network | undefined => byChainId.get(chainId);
