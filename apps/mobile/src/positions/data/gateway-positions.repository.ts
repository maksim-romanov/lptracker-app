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
  readonly failures: ReadonlyArray<{ address: string; chainId: number; protocol: string }>;
  readonly warning: string | null;
}

export interface TPositionsListResult {
  readonly data: ReadonlyArray<TGatewayPosition>;
  readonly tokens: TTokensMap;
  readonly meta: { readonly partial?: TPartialMeta };
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
      meta: { partial: this.readPartial(response) },
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

  private readPartial(response: Response): TPartialMeta | undefined {
    const header = response.headers.get("X-Partial-Failures");
    if (!header) return undefined;
    try {
      const failures = JSON.parse(header) as TPartialMeta["failures"];
      return { failures, warning: response.headers.get("Warning") };
    } catch {
      this.logger.warn("Failed to parse X-Partial-Failures header", { header });
      return undefined;
    }
  }

  private asError(response: Response | undefined, body: unknown): Error {
    const code = (body as { error?: { code?: string } } | undefined)?.error?.code ?? "GATEWAY_ERROR";
    return new Error(`Gateway ${response?.status ?? "?"}: ${code}`);
  }
}
