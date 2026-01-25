import { err, ok } from "neverthrow";
import { inject, injectable } from "tsyringe";

import { PositionsRepository } from "../data/positions.repository";

@injectable()
export class GetPositionUseCase {
  constructor(@inject(PositionsRepository) public readonly positionsRepository: PositionsRepository) {}

  async execute(id: string) {
    const arbitrumPositionRes = await this.positionsRepository.getPosition(id);
    if (arbitrumPositionRes.isErr()) return err(arbitrumPositionRes.error);

    return ok(arbitrumPositionRes.value);
  }
}
