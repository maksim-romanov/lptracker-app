import { Entity } from "../../../../shared/base/entity";

type TokenData = {
	address: string;
	symbol: string;
	decimals: number;
};

export class TokenEntity extends Entity<TokenData> {
	constructor(data: TokenData) {
		super(data);
	}

	get address(): string {
		return this._data.address;
	}

	get symbol(): string {
		return this._data.symbol;
	}

	get decimals(): number {
		return this._data.decimals;
	}
}
