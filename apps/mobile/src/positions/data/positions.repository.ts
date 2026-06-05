import type { PositionDetailVM } from "./fixtures/positions.fixtures";

export type TPosition = PositionDetailVM;

export interface IPositionsRepository {
  getPositions(params: { walletAddress: string; limit?: number; offset?: number }): Promise<TPosition[]>;
  getById(id: string): Promise<TPosition | null>;
}
