import { config } from "shared/config";
import { buildTokenRef, type MapPositionResult, type Position, type TokenMetaInput } from "shared/contracts";
import { formatUnits } from "viem";

import type { PositionEntity } from "../../domain/entities/position.entity";
import type { TokenEntity } from "../../domain/entities/token.entity";
import { UNISWAP_V3_EXTENSION_TYPE, type UniswapV3Extension } from "../schemas/extension.schema";

export interface MapperUnclaimedFees {
  /** Raw fee amount for token0 as a base-10 integer string */
  token0Raw: string;
  /** Raw fee amount for token1 as a base-10 integer string */
  token1Raw: string;
}

export interface MapPositionInput {
  entity: PositionEntity;
  chainId: number;
  unclaimedFees: MapperUnclaimedFees | null;
}

const formatFeeTierLabel = (feeTier: number): string => {
  const pct = feeTier / 10000;
  return `${pct < 0.01 ? pct.toFixed(4) : pct < 1 ? pct.toFixed(2) : pct.toFixed(2)}%`;
};

const buildPoolLabel = (token0: TokenEntity, token1: TokenEntity, feeTier: number): string =>
  `${token0.symbol}/${token1.symbol} ${formatFeeTierLabel(feeTier)}`;

const buildIconUrl = (chainId: number, address: string): string =>
  `${config.api.tokensData.baseUrl}/v1/chains/${chainId}/tokens/${address.toLowerCase()}/logo.png`;

const buildPositionRef = (chainId: number, nftTokenId: string): string => `uniswap-v3:${chainId}:${nftTokenId}`;

const buildPoolRef = (chainId: number, poolAddress: string): string => `uniswap-v3:${chainId}:${poolAddress.toLowerCase()}`;

const deriveStatusState = (
  liquidity: bigint,
  currentTick: number,
  tickLower: number,
  tickUpper: number,
): { state: string; stateDetail: string | null } => {
  if (liquidity === 0n) return { state: "closed", stateDetail: null };
  if (currentTick >= tickLower && currentTick < tickUpper) {
    return { state: "in-range", stateDetail: `tick ${currentTick} ∈ [${tickLower}, ${tickUpper})` };
  }
  return { state: "out-of-range", stateDetail: `tick ${currentTick} outside [${tickLower}, ${tickUpper})` };
};

export const mapV3PositionToContract = ({ entity, chainId, unclaimedFees }: MapPositionInput): MapPositionResult => {
  const pool = entity.pool;
  const token0 = pool.token0;
  const token1 = pool.token1;

  const sdkPosition = entity.sdk;
  const amount0Raw = BigInt(sdkPosition.amount0.quotient.toString());
  const amount1Raw = BigInt(sdkPosition.amount1.quotient.toString());

  const tokenRef0 = buildTokenRef(chainId, token0.address);
  const tokenRef1 = buildTokenRef(chainId, token1.address);

  const positionTokens: Position["tokens"] = [
    {
      role: "principal",
      tokenRef: tokenRef0,
      balance: {
        raw: amount0Raw.toString(),
        decimals: token0.decimals,
        formatted: formatUnits(amount0Raw, token0.decimals),
        tokenRef: tokenRef0,
      },
    },
    {
      role: "principal",
      tokenRef: tokenRef1,
      balance: {
        raw: amount1Raw.toString(),
        decimals: token1.decimals,
        formatted: formatUnits(amount1Raw, token1.decimals),
        tokenRef: tokenRef1,
      },
    },
  ];

  if (unclaimedFees) {
    const fee0 = BigInt(unclaimedFees.token0Raw);
    const fee1 = BigInt(unclaimedFees.token1Raw);
    if (fee0 > 0n || fee1 > 0n) {
      positionTokens.push(
        {
          role: "fee",
          tokenRef: tokenRef0,
          balance: {
            raw: unclaimedFees.token0Raw,
            decimals: token0.decimals,
            formatted: formatUnits(fee0, token0.decimals),
            tokenRef: tokenRef0,
          },
        },
        {
          role: "fee",
          tokenRef: tokenRef1,
          balance: {
            raw: unclaimedFees.token1Raw,
            decimals: token1.decimals,
            formatted: formatUnits(fee1, token1.decimals),
            tokenRef: tokenRef1,
          },
        },
      );
    }
  }

  const extension: UniswapV3Extension = {
    type: UNISWAP_V3_EXTENSION_TYPE,
    version: 1,
    tickLower: entity.tickLower,
    tickUpper: entity.tickUpper,
    liquidity: entity.liquidity.toString(),
    feeTier: pool.feeTier,
    feeTierLabel: formatFeeTierLabel(pool.feeTier),
    nftTokenId: entity.id,
    pool: {
      address: pool.id,
      currentTick: pool.currentTick,
      sqrtPriceX96: pool.sqrtPriceX96,
    },
  };

  const { state, stateDetail } = deriveStatusState(entity.liquidity, pool.currentTick, entity.tickLower, entity.tickUpper);

  const position: Position = {
    ref: buildPositionRef(chainId, entity.id),
    address: entity.owner.toLowerCase(),
    chainId,
    protocol: "uniswap-v3",
    protocolVersion: "3",
    container: {
      kind: "pool",
      ref: buildPoolRef(chainId, pool.id),
      label: buildPoolLabel(token0, token1, pool.feeTier),
    },
    tokens: positionTokens,
    status: { state, stateDetail },
    createdAt: null,
    updatedAt: new Date().toISOString(),
    extension,
  };

  const tokenMetaInputs: TokenMetaInput[] = [
    { chainId, address: token0.address, symbol: token0.symbol, decimals: token0.decimals },
    { chainId, address: token1.address, symbol: token1.symbol, decimals: token1.decimals },
  ];

  return { position, tokenMetaInputs };
};

export const buildTokenMetaIconUrl = buildIconUrl;
