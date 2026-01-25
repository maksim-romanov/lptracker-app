import { inject, injectable } from "tsyringe";

import { CHAIN_CONTEXT, GRAPHQL_CLIENT, RPC_CLIENT } from "../../di/tokens";
import type { ChainContext } from "../clients/chain-context";
import type { GraphQLClient } from "../clients/graph";
import type { RPCClient } from "../clients/rpc";

@injectable()
export class BaseRepository {
  constructor(
    @inject(CHAIN_CONTEXT) public readonly chainContext: ChainContext,
    @inject(GRAPHQL_CLIENT) public readonly graphQLClient: GraphQLClient,
    @inject(RPC_CLIENT) public readonly rpcClient: RPCClient,
  ) {}

  get gql() {
    return this.graphQLClient.client;
  }

  get rpc() {
    return this.rpcClient.client;
  }

  get context() {
    return this.chainContext;
  }
}
