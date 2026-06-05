import type { ExtensionVariantSchema } from "shared/contracts";
import { container } from "tsyringe";
import { GetPositionUseCase } from "uniswap-v3/app/get-position.usecase";
import { GetWalletPositionsUseCase } from "uniswap-v3/app/get-wallet-positions.usecase";
import { getContainer } from "uniswap-v3/di/containers";
import { uniswapV3ExtensionSchema } from "uniswap-v3/presentation/schemas/extension.schema";
import { arbitrum, base, mainnet } from "viem/chains";

import type { ProtocolDetailParams, ProtocolEntry, ProtocolListParams } from "./types";

export const UNISWAP_V3_SLUG = "uniswap-v3";

export const uniswapV3ProtocolEntry: ProtocolEntry = {
  slug: UNISWAP_V3_SLUG,
  version: "3",
  supportedChainIds: [mainnet.id, arbitrum.id, base.id],
  capabilities: ["concentrated-liquidity", "nft-positions", "claim-fees"],
  extensionVersion: "1",
  extensionSchema: uniswapV3ExtensionSchema as unknown as ExtensionVariantSchema,

  async listPositionsForChain(params: ProtocolListParams) {
    const useCase = container.resolve(GetWalletPositionsUseCase);
    return useCase.execute({
      owner: params.ownerAddress,
      chainId: params.chainId,
      pagination: params.pagination,
      filters: params.filters,
    });
  },

  async getPositionByRef(params: ProtocolDetailParams) {
    const useCase = getContainer(params.chainId).resolve(GetPositionUseCase);
    return useCase.execute({
      id: params.protocolPositionId,
    });
  },
};
