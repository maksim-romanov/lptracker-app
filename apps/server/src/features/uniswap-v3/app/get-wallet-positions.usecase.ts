import { err, ok } from "neverthrow";
import { injectable } from "tsyringe";
import { arbitrum } from "viem/chains";

import { PositionsRepository } from "../data/positions.repository";
import { getContainer } from "../di/containers";

@injectable()
export class GetWalletPositionsUseCase {
  // constructor(@inject(PositionsRepository) readonly _positionsRepository: PositionsRepository) {}

  async execute(owner: string) {
    const arbitrumPositionsRes = await getContainer(arbitrum.id).resolve(PositionsRepository).getWalletPositions(owner);
    if (arbitrumPositionsRes.isErr()) return err(arbitrumPositionsRes.error);

    return ok(arbitrumPositionsRes.value);
  }
}
