import { container } from "tsyringe";
import { arbitrum, base, mainnet } from "viem/chains";

const mainnetContainer = container.createChildContainer();
const arbitrumContainer = container.createChildContainer();
const baseContainer = container.createChildContainer();

export const getContainer = (chainId: number | string) => {
  const id = Number(chainId);

  if (id === mainnet.id) return mainnetContainer;
  if (id === arbitrum.id) return arbitrumContainer;
  if (id === base.id) return baseContainer;

  throw new Error(`Chain ${chainId} not supported`);
};
