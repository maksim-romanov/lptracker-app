import { inject, injectable } from "tsyringe";

import { GRAPHQL_CLIENT, RPC_CLIENT } from "../../di/tokens";
import type { GraphQLClient } from "../clients/graph";
import type { RPCClient } from "../clients/rpc";

@injectable()
export class BaseRepository {
  constructor(
    @inject(GRAPHQL_CLIENT) public readonly graphQLClient: GraphQLClient,
    @inject(RPC_CLIENT) public readonly rpcClient: RPCClient,
  ) {}

  get gql() {
    return this.graphQLClient.client;
  }

  get rpc(): RPCClient {
    return this.rpcClient;
  }
}
