import { NETWORKS } from "@mars-909/catalog";
import { config } from "shared/config";
import type { Network } from "shared/contracts";

const buildNetworkIconUrl = (chainId: number): string => `${config.api.tokensData.baseUrl}/v1/chains/${chainId}/icon.png`;

export const networkCatalog: Network[] = NETWORKS.map((seed) => ({
  ...seed,
  iconUrl: buildNetworkIconUrl(seed.chainId),
}));

const byChainId = new Map<number, Network>(networkCatalog.map((n) => [n.chainId, n]));

export const isKnownChainId = (chainId: number): boolean => byChainId.has(chainId);
export const knownChainIds = (): number[] => [...byChainId.keys()];
export const networkByChainId = (chainId: number): Network | undefined => byChainId.get(chainId);
