import { PROTOCOLS_META } from "@depthly/catalog";
import type { ExtensionVariantSchema } from "shared/contracts";
import { container } from "tsyringe";
import { GetPositionUseCase } from "uniswap-v3/app/get-position.usecase";
import { GetWalletPositionsUseCase } from "uniswap-v3/app/get-wallet-positions.usecase";
import { getContainer } from "uniswap-v3/di/containers";
import { mapV3Error } from "uniswap-v3/presentation/error-mapper";
import { uniswapV3ExtensionSchema } from "uniswap-v3/presentation/schemas/extension.schema";

import type { ProtocolDetailParams, ProtocolEntry, ProtocolListParams } from "./types";

export const UNISWAP_V3_SLUG = "uniswap-v3";

const meta = PROTOCOLS_META["uniswap-v3"];

export const uniswapV3ProtocolEntry: ProtocolEntry = {
  slug: UNISWAP_V3_SLUG,
  version: meta.version,
  supportedChainIds: [...meta.supportedChainIds],
  capabilities: [...meta.capabilities],
  extensionVersion: String(meta.extensionVersion),
  extensionSchema: uniswapV3ExtensionSchema as unknown as ExtensionVariantSchema,

  mapError: mapV3Error,

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
