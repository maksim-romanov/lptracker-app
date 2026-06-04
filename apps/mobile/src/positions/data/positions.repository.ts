import type { GatewayApiClient } from "core/api-client/di/register";
import { GATEWAY_API } from "core/api-client/di/tokens";
import { ApiError } from "core/api-client/domain/api.error";
import type { operations } from "core/api-client/generated/gateway";
import { container } from "core/di/container";
import { Repository } from "core/domain/base/repository";

import type { PositionDetailVM } from "./fixtures/positions.fixtures";

export type TPosition = PositionDetailVM;

export interface IPositionsRepository {
  getPositions(params: { walletAddress: string; limit?: number; offset?: number }): Promise<TPosition[]>;
  getById(id: string): Promise<TPosition | null>;
}

type PositionsQuery = NonNullable<operations["getWallets:walletAddressPositions"]["parameters"]["query"]>;

type GetPositionsParams = {
  walletAddress: string;
  limit: number;
  offset: number;
  chainIds?: PositionsQuery["chainIds"];
};

// Gateway-backed implementation. Not registered yet — currently the mobile app
// runs against MockPositionsRepository. The Gateway endpoint and DTOs (raw
// `UniswapV3Position` schema) need a mapper into TPosition before this can
// implement IPositionsRepository in full.
export class GatewayPositionsRepository extends Repository {
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
