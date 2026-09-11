import type { GatewayApiClient } from "core/api-client/di/register";
import { GATEWAY_API } from "core/api-client/di/tokens";
import { Repository } from "core/domain/base/repository";
import type { TGatewayPosition, TKnownExtensionType, TTokensMap } from "positions/domain/types";
import { inject, injectable } from "tsyringe";

export interface TPositionsListParams {
  readonly wallets: ReadonlyArray<{
    readonly address: string;
    readonly chainIds: ReadonlyArray<number>;
  }>;
  readonly protocols?: ReadonlyArray<TKnownExtensionType>;
  readonly status?: "open" | "closed" | "all";
}

export interface TPartialMeta {
  readonly failures: ReadonlyArray<{ protocol: string; chainId: number; message: string }>;
}

export interface TPositionsListResult {
  readonly data: ReadonlyArray<TGatewayPosition>;
  readonly tokens: TTokensMap;
  readonly meta: { readonly partialFailures: TPartialMeta["failures"] };
}

export interface TPositionsDetailResult {
  readonly data: TGatewayPosition;
  readonly tokens: TTokensMap;
}

@injectable()
export class GatewayPositionsRepository extends Repository {
  constructor(@inject(GATEWAY_API) private readonly client: GatewayApiClient) {
    super();
  }

  async list(params: TPositionsListParams): Promise<TPositionsListResult> {
    const wallets = this.serializeWallets(params.wallets);
    const { data, response, error } = await this.client.GET("/positions", {
      params: {
        query: {
          wallets: [wallets],
          protocols: params.protocols?.join(","),
          status: params.status,
        },
      },
    });
    if (error || !data) {
      throw this.asError(response, error);
    }
    return {
      data: data.data,
      tokens: data.tokens,
      meta: { partialFailures: data.meta.partialFailures },
    };
  }

  async getByRef(ref: string): Promise<TPositionsDetailResult> {
    const { data, response, error } = await this.client.GET("/positions/{ref}", {
      params: { path: { ref } },
    });
    if (error || !data) throw this.asError(response, error);
    return { data: data.data, tokens: data.tokens };
  }

  private serializeWallets(wallets: TPositionsListParams["wallets"]): string {
    return wallets
      .filter((w) => w.chainIds.length > 0)
      .map((w) => `${w.address}:${w.chainIds.join(",")}`)
      .join("|");
  }

  private asError(response: Response | undefined, body: unknown): Error {
    const code = (body as { error?: { code?: string } } | undefined)?.error?.code ?? "GATEWAY_ERROR";
    return new Error(`Gateway ${response?.status ?? "?"}: ${code}`);
  }
}
