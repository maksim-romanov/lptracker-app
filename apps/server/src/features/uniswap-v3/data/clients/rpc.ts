import { inject, injectable } from "tsyringe";
import { type Chain, createPublicClient, fallback, http, type PublicClient } from "viem";

import { CHAIN_CONTEXT } from "../../di/tokens";
import type { ChainContext } from "./chain-context";

@injectable()
export class RPCClient {
  private clientsMap = new Map<Chain["id"], PublicClient>();

  constructor(@inject(CHAIN_CONTEXT) readonly context: ChainContext) {}

  get client(): PublicClient {
    const client = this.clientsMap.get(this.context.chain.id);
    if (client) return client;

    const newRpcClient = createPublicClient({
      chain: this.context.chain,
      transport: fallback(
        this.context.rpcUrls.map((url) => http(url)),
        { rank: true, retryCount: 3, retryDelay: 150 },
      ),
    });

    this.clientsMap.set(this.context.chain.id, newRpcClient);
    return newRpcClient;
  }
}
