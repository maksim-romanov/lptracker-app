import { Repository } from "core/domain/base/repository";
import { injectable } from "tsyringe";

import { POSITIONS_MOCK } from "./fixtures/positions.fixtures";
import type { IPositionsRepository, TPosition } from "./positions.repository";

@injectable()
export class MockPositionsRepository extends Repository implements IPositionsRepository {
  async getPositions(): Promise<TPosition[]> {
    return POSITIONS_MOCK;
  }

  async getById(id: string): Promise<TPosition | null> {
    return POSITIONS_MOCK.find((p) => p.id === id) ?? null;
  }
}
