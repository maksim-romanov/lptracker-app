import { arbitrum, mainnet } from "viem/chains";

import { ChainContext } from "../data/clients/chain-context";
import { GraphQLClient } from "../data/clients/graph";
import { RPCClient } from "../data/clients/rpc";
import { PositionsRepository } from "../data/positions.repository";
import { getContainer } from "./containers";
import { CHAIN_CONTEXT, GRAPHQL_CLIENT, POSITIONS_REPOSITORY, RPC_CLIENT } from "./tokens";

const registerChain = (chainId: number) => {
  const container = getContainer(chainId);
  container.register(CHAIN_CONTEXT, { useValue: new ChainContext(chainId) });
  container.registerSingleton(GRAPHQL_CLIENT, GraphQLClient);
  container.registerSingleton(RPC_CLIENT, RPCClient);
  container.register(POSITIONS_REPOSITORY, { useClass: PositionsRepository });
};

export const register = () => {
  registerChain(mainnet.id);
  registerChain(arbitrum.id);
};
