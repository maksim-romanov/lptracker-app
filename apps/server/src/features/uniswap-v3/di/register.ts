import { arbitrum, mainnet } from "viem/chains";

import { ChainContext } from "../data/clients/chain-context";
import { GraphQLClient } from "../data/clients/graph";
import { RPCClient } from "../data/clients/rpc";
import { PositionsRepository } from "../data/positions.repository";
import { getContainer } from "./containers";
import { CHAIN_CONTEXT, GRAPHQL_CLIENT, POSITIONS_REPOSITORY, RPC_CLIENT } from "./tokens";

const registerArbitrum = () => {
  const arbitrumContainer = getContainer(arbitrum.id);
  arbitrumContainer.register(CHAIN_CONTEXT, { useValue: new ChainContext(arbitrum.id) });
  arbitrumContainer.registerSingleton(GRAPHQL_CLIENT, GraphQLClient);
  arbitrumContainer.registerSingleton(RPC_CLIENT, RPCClient);
  arbitrumContainer.register(POSITIONS_REPOSITORY, { useClass: PositionsRepository });
};

const registerMainnet = () => {
  const mainnetContainer = getContainer(mainnet.id);
  mainnetContainer.register(CHAIN_CONTEXT, { useValue: new ChainContext(mainnet.id) });
  mainnetContainer.registerSingleton(GRAPHQL_CLIENT, GraphQLClient);
  mainnetContainer.registerSingleton(RPC_CLIENT, RPCClient);
  mainnetContainer.register(POSITIONS_REPOSITORY, { useClass: PositionsRepository });
};

export const register = () => {
  registerMainnet();
  registerArbitrum();
};
