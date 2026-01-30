import { ok } from "neverthrow";
import { injectable } from "tsyringe";
import { arbitrum } from "viem/chains";

import type { GraphQLPositionDto } from "../data/dto/graphql-position.dto";
import { PositionsRepository } from "../data/positions.repository";
import { getContainer } from "../di/containers";
import { UNISWAP_V3_PROTOCOL } from "../domain/constants/protocol";
import type { UniswapV3WrappedPosition } from "../presentation/schemas/response.schemas";

export interface GetWalletPositionsParams {
  owner: string;
  chainIds?: number[];
  pagination?: { limit: number; offset: number };
  filters?: { closed: boolean };
}

@injectable()
export class GetWalletPositionsUseCase {
  async execute(params: GetWalletPositionsParams) {
    const { owner, chainIds = [arbitrum.id], pagination, filters } = params;

    const results = await Promise.all(
      chainIds.map(async (chainId) => {
        const repository = getContainer(chainId).resolve(PositionsRepository);
        const result = await repository.getWalletPositions(
          owner,
          pagination ? { first: pagination.limit, skip: pagination.offset } : undefined,
          filters,
        );

        if (result.isErr()) {
          return { chainId, positions: [] as GraphQLPositionDto[] };
        }

        return { chainId, positions: result.value };
      }),
    );

    const wrappedPositions: UniswapV3WrappedPosition[] = results.flatMap(({ chainId, positions }) =>
      positions.map((dto) => ({
        protocol: UNISWAP_V3_PROTOCOL,
        chainId,
        data: dto.toDomain().response,
      })),
    );

    return ok(wrappedPositions);
  }
}
