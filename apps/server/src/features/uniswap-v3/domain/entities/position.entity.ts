import { Entity } from "../../../../shared/base/entity";
import type { PoolEntity } from "./pool.entity";

type PositionData = {
	id: string;
	tickLower: number;
	tickUpper: number;
	liquidity: string;
	pool: PoolEntity;
};

export class PositionEntity extends Entity<PositionData> {
	constructor(data: PositionData) {
		super(data);
	}

	get id(): string {
		return this._data.id;
	}

	get tickLower(): number {
		return this._data.tickLower;
	}

	get tickUpper(): number {
		return this._data.tickUpper;
	}

	get liquidity(): bigint {
		return BigInt(this._data.liquidity);
	}

	get pool(): PoolEntity {
		return this._data.pool;
	}

	// Simple getters (Thin Entity pattern)
	get isActive(): boolean {
		return this.liquidity > 0n;
	}

	get isClosed(): boolean {
		return this.liquidity === 0n;
	}
}
