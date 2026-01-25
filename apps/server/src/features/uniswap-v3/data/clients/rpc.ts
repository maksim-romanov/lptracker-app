import { inject, injectable } from "tsyringe";
import { type Chain, createPublicClient, fallback, http, type PublicClient } from "viem";

import { CHAIN_CONTEXT } from "../../di/tokens";
import type { ChainContext } from "./chain-context";

@injectable()
export class RPCClient {
  private clientsMap = new Map<Chain["id"], PublicClient>();

  constructor(@inject(CHAIN_CONTEXT) readonly context: ChainContext) {}

  public getClient(chain: Chain): PublicClient {
    const client = this.clientsMap.get(chain.id);
    if (client) return client;

    const newRpcClient = createPublicClient({
      chain,
      transport: fallback(
        this.context.rpcUrls.map((url) => http(url)),
        { rank: true, retryCount: 3, retryDelay: 150 },
      ),
    });

    this.clientsMap.set(chain.id, newRpcClient);
    return newRpcClient;
  }
}
