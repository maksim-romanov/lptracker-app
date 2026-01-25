import { GraphQLClient as GraphQLClientRequest } from "graphql-request";
import { inject, injectable } from "tsyringe";
import type { Chain } from "viem";

import { CHAIN_CONTEXT } from "../../di/tokens";
import type { ChainContext } from "./chain-context";

@injectable()
export class GraphQLClient {
  private clientsMap = new Map<Chain["id"], GraphQLClientRequest>();

  constructor(@inject(CHAIN_CONTEXT) readonly context: ChainContext) {}

  get client(): GraphQLClientRequest {
    const client = this.clientsMap.get(this.context.chain.id);
    if (client) return client;

    const newGraphClient = new GraphQLClientRequest(this.context.graphUrl, {
      headers: { Authorization: `Bearer ${Bun.env.GRAPH_API_KEY}` },
    });

    this.clientsMap.set(this.context.chain.id, newGraphClient);
    return newGraphClient;
  }
}
