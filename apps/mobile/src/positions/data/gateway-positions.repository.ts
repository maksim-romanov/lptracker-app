import type { GatewayApiClient } from "core/api-client/di/register";
import { GATEWAY_API } from "core/api-client/di/tokens";
import { Repository } from "core/domain/base/repository";
import { inject, injectable } from "tsyringe";

import type {
  IPositionsRepository,
  TPartialMeta,
  TPositionsDetailResult,
  TPositionsListParams,
  TPositionsListResult,
} from "./positions.repository";

@injectable()
export class GatewayPositionsRepository extends Repository implements IPositionsRepository {
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
          cursor: params.cursor,
          limit: params.limit,
        },
      },
    });
    if (error || !data) {
      throw this.asError(response, error);
    }
    return {
      data: data.data,
      tokens: data.tokens,
      page: data.page.cursor ? { nextCursor: data.page.cursor } : undefined,
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
