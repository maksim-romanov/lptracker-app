import { container } from "tsyringe";
import { arbitrum, mainnet } from "viem/chains";

import { ChainContext } from "../data/clients/chain-context";
import { GraphQLClient } from "../data/clients/graph";
import { RPCClient } from "../data/clients/rpc";
import { PositionFeesCache } from "../data/position-fees.cache";
import { PositionsRepository } from "../data/positions.repository";
import { getContainer } from "./containers";
import { CHAIN_CONTEXT, GRAPHQL_CLIENT, POSITION_FEES_CACHE, POSITIONS_REPOSITORY, RPC_CLIENT } from "./tokens";

const registerChain = (chainId: number) => {
  const chainContainer = getContainer(chainId);
  chainContainer.register(CHAIN_CONTEXT, { useValue: new ChainContext(chainId) });
  chainContainer.registerSingleton(GRAPHQL_CLIENT, GraphQLClient);
  chainContainer.registerSingleton(RPC_CLIENT, RPCClient);
  chainContainer.register(POSITIONS_REPOSITORY, { useClass: PositionsRepository });
};

export const register = () => {
  container.register(POSITION_FEES_CACHE, { useToken: PositionFeesCache });

  registerChain(mainnet.id);
  registerChain(arbitrum.id);
};
