import type { GatewayApiClient } from "core/api-client/di/register";
import { GATEWAY_API } from "core/api-client/di/tokens";
import { ApiError } from "core/api-client/domain/api.error";
import { container } from "core/di/container";
import { Repository } from "core/domain/base/repository";

type GetPositionsParams = {
  walletAddress: string;
  limit: number;
  offset: number;
};

export class PositionsRepository extends Repository {
  private readonly api = container.resolve<GatewayApiClient>(GATEWAY_API);

  async getPositions({ walletAddress, limit, offset }: GetPositionsParams) {
    try {
      const { data } = await this.api.GET("/wallets/{walletAddress}/positions", {
        params: { path: { walletAddress }, query: { limit, offset } },
      });

      return data ?? [];
    } catch (error) {
      if (ApiError.isInstance(error)) this.logger.error("Failed to fetch positions", { walletAddress, statusCode: error.statusCode });

      throw error;
    }
  }
}
