import type { Position } from "./position.schema";

export interface TokenMetaInput {
  chainId: number;
  address: string;
  symbol: string;
  decimals: number;
}

export interface MapPositionResult {
  position: Position;
  tokenMetaInputs: TokenMetaInput[];
}
