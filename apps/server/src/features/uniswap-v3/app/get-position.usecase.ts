import { err, ok } from "neverthrow";
import { inject, injectable } from "tsyringe";

import { PositionsRepository } from "../data/positions.repository";

@injectable()
export class GetPositionUseCase {
  constructor(@inject(PositionsRepository) public readonly positionsRepository: PositionsRepository) {}

  async execute(id: string) {
    const result = await this.positionsRepository.getPosition(id);
    if (result.isErr()) return err(result.error);

    return ok(result.value.toDomain().response);
  }
}
