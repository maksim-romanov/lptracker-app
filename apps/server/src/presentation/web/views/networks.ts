type TNetwork = { id: number; label: string; uni: string; explorer: string };

export const NETWORKS: TNetwork[] = [
  { id: 1, label: "Ethereum", uni: "ethereum", explorer: "https://etherscan.io" },
  { id: 8453, label: "Base", uni: "base", explorer: "https://basescan.org" },
  { id: 42161, label: "Arbitrum", uni: "arbitrum", explorer: "https://arbiscan.io" },
];

const byId = (chainId: number): TNetwork | undefined => NETWORKS.find((n) => n.id === chainId);

export const networkLabel = (chainId: number): string => byId(chainId)?.label ?? `Chain ${chainId}`;
export const networkKey = (chainId: number): string => byId(chainId)?.uni ?? "unknown";

export const uniswapPositionUrl = (chainId: number, tokenId: string): string =>
  `https://app.uniswap.org/positions/v3/${byId(chainId)?.uni ?? "ethereum"}/${tokenId}`;

export const explorerAddressUrl = (chainId: number, address: string): string =>
  `${byId(chainId)?.explorer ?? "https://etherscan.io"}/address/${address}`;
