import { NETWORKS } from "@depthly/catalog";
import type { Network } from "shared/contracts";

export const networkCatalog: Network[] = NETWORKS.map((seed) => ({ ...seed }));

const byChainId = new Map<number, Network>(networkCatalog.map((n) => [n.chainId, n]));

export const isKnownChainId = (chainId: number): boolean => byChainId.has(chainId);
export const knownChainIds = (): number[] => [...byChainId.keys()];
export const networkByChainId = (chainId: number): Network | undefined => byChainId.get(chainId);
