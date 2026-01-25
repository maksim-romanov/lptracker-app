import { err, ok } from "neverthrow";
import { injectable } from "tsyringe";
import { arbitrum } from "viem/chains";

import { PositionsRepository } from "../data/positions.repository";
import { getContainer } from "../di/containers";

@injectable()
export class GetPositionUseCase {
  async execute(id: string) {
    const arbitrumPositionRes = await getContainer(arbitrum.id).resolve(PositionsRepository).getPosition(id);
    if (arbitrumPositionRes.isErr()) return err(arbitrumPositionRes.error);

    return ok(arbitrumPositionRes.value);
  }
}
