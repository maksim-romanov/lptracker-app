import type { GatewayApiClient } from "core/api-client/di/register";
import type { operations } from "core/api-client/generated/gateway";
import { GATEWAY_API } from "core/api-client/di/tokens";
import { ApiError } from "core/api-client/domain/api.error";
import { container } from "core/di/container";
import { Repository } from "core/domain/base/repository";

type PositionsQuery = NonNullable<operations["getWallets:walletAddressPositions"]["parameters"]["query"]>;

type GetPositionsParams = {
  walletAddress: string;
  limit: number;
  offset: number;
  chainIds?: PositionsQuery["chainIds"];
};

export class PositionsRepository extends Repository {
  private readonly api = container.resolve<GatewayApiClient>(GATEWAY_API);

  async getPositions({ walletAddress, limit, offset, chainIds }: GetPositionsParams) {
    try {
      const { data } = await this.api.GET("/wallets/{walletAddress}/positions", {
        params: { path: { walletAddress }, query: { limit, offset, chainIds } },
      });

      return data ?? [];
    } catch (error) {
      if (ApiError.isInstance(error)) this.logger.error("Failed to fetch positions", { walletAddress, statusCode: error.statusCode });

      throw error;
    }
  }
}
