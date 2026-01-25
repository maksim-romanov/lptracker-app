import { ok } from "neverthrow";
import { injectable } from "tsyringe";
import { arbitrum } from "viem/chains";

import { PositionsRepository } from "../data/positions.repository";
import { getContainer } from "../di/containers";

@injectable()
export class GetWalletPositionsUseCase {
  // constructor(@inject(PositionsRepository) readonly _positionsRepository: PositionsRepository) {}

  async execute(owner: string, chainIds = [arbitrum.id]) {
    const positions = await Promise.all(
      chainIds.map(async (chainId) => {
        return getContainer(chainId).resolve(PositionsRepository).getWalletPositions(owner);
      }),
    );

    const successfulPositions = positions.filter((p) => p.isOk());
    const _failedPositions = positions.filter((p) => p.isErr());

    return ok(successfulPositions.flatMap((p) => p.value));
  }
}
