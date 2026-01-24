import { Entity } from "../../../../shared/base/entity";
import type { TokenEntity } from "./token.entity";

type PoolData = {
	id: string;
	feeTier: number;
	currentTick: number;
	sqrtPriceX96: string;
	token0: TokenEntity;
	token1: TokenEntity;
};

export class PoolEntity extends Entity<PoolData> {
	constructor(data: PoolData) {
		super(data);
	}

	get id(): string {
		return this._data.id;
	}

	get feeTier(): number {
		return this._data.feeTier;
	}

	get currentTick(): number {
		return this._data.currentTick;
	}

	get sqrtPriceX96(): string {
		return this._data.sqrtPriceX96;
	}

	get token0(): TokenEntity {
		return this._data.token0;
	}

	get token1(): TokenEntity {
		return this._data.token1;
	}
}
