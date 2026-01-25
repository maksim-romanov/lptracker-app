import { container } from "tsyringe";
import { arbitrum, mainnet } from "viem/chains";

const mainnetContainer = container.createChildContainer();
const arbitrumContainer = container.createChildContainer();

export const getContainer = (chainId: number | string) => {
  const id = Number(chainId);

  if (id === mainnet.id) return mainnetContainer;
  if (id === arbitrum.id) return arbitrumContainer;

  throw new Error(`Chain ${chainId} not supported`);
};
