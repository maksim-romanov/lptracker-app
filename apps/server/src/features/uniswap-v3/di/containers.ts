import { container } from "tsyringe";
import { arbitrum, mainnet } from "viem/chains";

const mainnetContainer = container.createChildContainer();
const arbitrumContainer = container.createChildContainer();

export const getContainer = (chainId: number) => {
  if (chainId === mainnet.id) return mainnetContainer;
  if (chainId === arbitrum.id) return arbitrumContainer;

  throw new Error(`Chain ${chainId} not supported`);
};
