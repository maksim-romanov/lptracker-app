import { ok } from "neverthrow";
import { injectable } from "tsyringe";
import { arbitrum } from "viem/chains";

import { PositionsRepository } from "../data/positions.repository";
import { getContainer } from "../di/containers";

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

    const positions = await Promise.all(
      chainIds.map(async (chainId) => {
        const repository = getContainer(chainId).resolve(PositionsRepository);
        return repository.getWalletPositions(owner, pagination ? { first: pagination.limit, skip: pagination.offset } : undefined, filters);
      }),
    );

    const successfulPositions = positions.filter((p) => p.isOk());
    const _failedPositions = positions.filter((p) => p.isErr());

    return ok(successfulPositions.flatMap((p) => p.value));
  }
}
