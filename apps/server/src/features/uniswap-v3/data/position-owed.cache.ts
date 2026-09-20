import { singleton } from "tsyringe";

import type { PositionEntity } from "../domain/entities/position.entity";
import type { ComputedOwedBalance } from "../domain/utils/fee-math";
import { BaseCache } from "#shared/cache/base-cache";

@singleton()
export class PositionOwedCache extends BaseCache<ComputedOwedBalance> {
  protected readonly prefix = "owed";
  protected readonly ttl = 30;

  private id(chainId: number, positionId: string) {
    return `${chainId}:${positionId}`;
  }

  getOwed(chainId: number, positionId: string) {
    return this.get(this.id(chainId, positionId));
  }

  setOwed(chainId: number, positionId: string, owed: ComputedOwedBalance) {
    return this.set(this.id(chainId, positionId), owed);
  }

  async partition(chainId: number, positions: PositionEntity[]) {
    const values = await this.getMany(positions.map((p) => this.id(chainId, p.id)));

    const cached = new Map<string, ComputedOwedBalance>();
    const uncached: PositionEntity[] = [];
    for (let i = 0; i < positions.length; i++) {
      const owed = values[i];
      if (owed !== undefined) cached.set(positions[i]!.id, owed);
      else uncached.push(positions[i]!);
    }
    return { cached, uncached };
  }
}
