import { BaseCache } from "shared/cache/base-cache";
import { singleton } from "tsyringe";

import type { PositionEntity } from "../domain/entities/position.entity";
import type { ComputedFees } from "../domain/utils/fee-math";

@singleton()
export class PositionFeesCache extends BaseCache<ComputedFees> {
  protected readonly prefix = "fees";
  protected readonly ttl = 30;

  private id(chainId: number, positionId: string) {
    return `${chainId}:${positionId}`;
  }

  getFees(chainId: number, positionId: string) {
    return this.get(this.id(chainId, positionId));
  }

  setFees(chainId: number, positionId: string, fees: ComputedFees) {
    return this.set(this.id(chainId, positionId), fees);
  }

  async partition(chainId: number, positions: PositionEntity[]) {
    const values = await this.getMany(positions.map((p) => this.id(chainId, p.id)));

    const cached = new Map<string, ComputedFees>();
    const uncached: PositionEntity[] = [];
    for (let i = 0; i < positions.length; i++) {
      const fees = values[i];
      if (fees !== undefined) cached.set(positions[i]!.id, fees);
      else uncached.push(positions[i]!);
    }
    return { cached, uncached };
  }
}
