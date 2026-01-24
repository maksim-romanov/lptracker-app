import { injectable } from "tsyringe";
import { Result, ok, err } from "neverthrow";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import NonfungiblePositionManagerABI from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import { type Address, type PublicClient, createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";
import { Service } from "../../../shared/base/service";
import { PositionError, PositionErrorCode } from "../domain/errors/position.error";
import { networks } from "../../../constants";

type TickData = [bigint, bigint, bigint, bigint, bigint, bigint, bigint, boolean];
type PositionData = [bigint, Address, Address, Address, number, number, number, bigint, bigint, bigint, bigint, bigint];

export type OnChainPositionData = {
	feeGrowthGlobal0X128: bigint;
	feeGrowthGlobal1X128: bigint;
	feeGrowthOutside0LowerX128: bigint;
	feeGrowthOutside1LowerX128: bigint;
	feeGrowthOutside0UpperX128: bigint;
	feeGrowthOutside1UpperX128: bigint;
	feeGrowthInside0LastX128: bigint;
	feeGrowthInside1LastX128: bigint;
	tokensOwed0: bigint;
	tokensOwed1: bigint;
	onChainLiquidity: bigint;
};

@injectable()
export class BlockchainService extends Service {
	private readonly publicClient: PublicClient;

	constructor() {
		super();
		this.publicClient = createPublicClient({
			chain: arbitrum,
			transport: http(networks.arbitrum.alchemy.rpcUrl),
		});
	}

	/**
	 * Fetch on-chain data for position fees calculation
	 */
	async getPositionOnChainData(
		poolAddress: Address,
		tokenId: bigint,
		tickLower: number,
		tickUpper: number,
	): Promise<Result<OnChainPositionData, PositionError>> {
		try {
			const multicallResults = await this.publicClient.multicall({
				contracts: [
					{ address: poolAddress, abi: IUniswapV3PoolABI.abi, functionName: "feeGrowthGlobal0X128" },
					{ address: poolAddress, abi: IUniswapV3PoolABI.abi, functionName: "feeGrowthGlobal1X128" },
					{ address: poolAddress, abi: IUniswapV3PoolABI.abi, functionName: "ticks", args: [tickLower] },
					{ address: poolAddress, abi: IUniswapV3PoolABI.abi, functionName: "ticks", args: [tickUpper] },
					{
						address: networks.arbitrum.deployments.NonfungiblePositionManager,
						abi: NonfungiblePositionManagerABI.abi,
						functionName: "positions",
						args: [tokenId],
					},
				],
			});

			if (multicallResults.some((r) => r.status === "failure")) {
				return err(new PositionError(PositionErrorCode.FETCH_FAILED, "Failed to fetch on-chain data"));
			}

			const feeGrowthGlobal0X128 = multicallResults[0].result as bigint;
			const feeGrowthGlobal1X128 = multicallResults[1].result as bigint;
			const tickLowerData = multicallResults[2].result as TickData;
			const tickUpperData = multicallResults[3].result as TickData;
			const positionData = multicallResults[4].result as PositionData;

			return ok({
				feeGrowthGlobal0X128,
				feeGrowthGlobal1X128,
				feeGrowthOutside0LowerX128: tickLowerData[2],
				feeGrowthOutside1LowerX128: tickLowerData[3],
				feeGrowthOutside0UpperX128: tickUpperData[2],
				feeGrowthOutside1UpperX128: tickUpperData[3],
				feeGrowthInside0LastX128: positionData[8],
				feeGrowthInside1LastX128: positionData[9],
				tokensOwed0: positionData[10],
				tokensOwed1: positionData[11],
				onChainLiquidity: positionData[7],
			});
		} catch (error) {
			return err(new PositionError(PositionErrorCode.FETCH_FAILED, undefined, { error }));
		}
	}
}
