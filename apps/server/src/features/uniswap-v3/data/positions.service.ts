import { injectable } from "tsyringe";
import { Result, ok, err } from "neverthrow";
import { Token } from "@uniswap/sdk-core";
import { Pool, Position, TickMath, tickToPrice } from "@uniswap/v3-sdk";
import JSBI from "jsbi";
import { arbitrum } from "viem/chains";
import { Service } from "../../../shared/base/service";
import { PositionError, PositionErrorCode } from "../domain/errors/position.error";
import type { PositionEntity } from "../domain/entities/position.entity";
import type { OnChainPositionData } from "./blockchain.service";
import { Q128, Q256 } from "../../../constants";

export type PositionAmounts = {
	token0: string;
	token1: string;
};

export type PriceRange = {
	token0PerToken1: {
		label: string;
		lower: string;
		current: string;
		upper: string;
	};
	token1PerToken0: {
		label: string;
		lower: string;
		current: string;
		upper: string;
	};
	isInRange: boolean;
};

export type PositionFees = {
	token0: {
		raw: string;
		formatted: number;
	};
	token1: {
		raw: string;
		formatted: number;
	};
	totals: {
		inToken0: number;
		inToken1: number;
	};
};

@injectable()
export class PositionsService extends Service {
	/**
	 * Calculate token amounts in position
	 */
	calculateAmounts(position: PositionEntity): Result<PositionAmounts, PositionError> {
		try {
			const { token0, token1 } = this.createTokens(position);
			const pool = this.createPool(position, token0, token1);
			const uniPosition = this.createPosition(position, pool);

			const amount0 = uniPosition.amount0.toSignificant(token0.decimals);
			const amount1 = uniPosition.amount1.toSignificant(token1.decimals);

			return ok({ token0: amount0, token1: amount1 });
		} catch (error) {
			return err(new PositionError(PositionErrorCode.CALCULATION_FAILED, undefined, { error }));
		}
	}

	/**
	 * Calculate price range
	 */
	calculatePriceRange(position: PositionEntity): Result<PriceRange, PositionError> {
		try {
			const { token0, token1 } = this.createTokens(position);
			const pool = this.createPool(position, token0, token1);

			const priceLowerT1PerT0 = tickToPrice(token0, token1, position.tickLower);
			const priceUpperT1PerT0 = tickToPrice(token0, token1, position.tickUpper);
			const currentPriceT1PerT0 = pool.token0Price;
			const currentPriceT0PerT1 = pool.token1Price;

			const isInRange = this.checkIsInRange(position);

			return ok({
				token0PerToken1: {
					label: `${token0.symbol}/${token1.symbol}`,
					lower: priceLowerT1PerT0.invert().toSignificant(6),
					current: currentPriceT0PerT1.toSignificant(6),
					upper: priceUpperT1PerT0.invert().toSignificant(6),
				},
				token1PerToken0: {
					label: `${token1.symbol}/${token0.symbol}`,
					lower: priceLowerT1PerT0.toSignificant(6),
					current: currentPriceT1PerT0.toSignificant(6),
					upper: priceUpperT1PerT0.toSignificant(6),
				},
				isInRange,
			});
		} catch (error) {
			return err(new PositionError(PositionErrorCode.CALCULATION_FAILED, undefined, { error }));
		}
	}

	// Private helpers

	private createTokens(position: PositionEntity) {
		const token0 = new Token(
			arbitrum.id,
			position.pool.token0.address,
			position.pool.token0.decimals,
			position.pool.token0.symbol,
			position.pool.token0.symbol,
		);

		const token1 = new Token(
			arbitrum.id,
			position.pool.token1.address,
			position.pool.token1.decimals,
			position.pool.token1.symbol,
			position.pool.token1.symbol,
		);

		return { token0, token1 };
	}

	private createPool(position: PositionEntity, token0: Token, token1: Token) {
		return new Pool(
			token0,
			token1,
			position.pool.feeTier,
			position.pool.sqrtPriceX96,
			position.liquidity.toString(),
			position.pool.currentTick,
		);
	}

	private createPosition(position: PositionEntity, pool: Pool) {
		return new Position({
			pool,
			liquidity: position.liquidity.toString(),
			tickLower: position.tickLower,
			tickUpper: position.tickUpper,
		});
	}

	private checkIsInRange(position: PositionEntity): boolean {
		const sqrtPriceX96JSBI = JSBI.BigInt(position.pool.sqrtPriceX96);
		const sqrtRatioLower = TickMath.getSqrtRatioAtTick(position.tickLower);
		const sqrtRatioUpper = TickMath.getSqrtRatioAtTick(position.tickUpper);

		return (
			JSBI.greaterThanOrEqual(sqrtPriceX96JSBI, JSBI.BigInt(sqrtRatioLower.toString())) &&
			JSBI.lessThan(sqrtPriceX96JSBI, JSBI.BigInt(sqrtRatioUpper.toString()))
		);
	}
}
