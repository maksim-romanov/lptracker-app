import type { TUniswapV3RangeStatus } from "../../domain/uniswap-v3.vm";

export type TPositionStatusTone = "success" | "warning" | "neutral" | "brand";

export interface IPositionStatusPresentation {
  readonly tone: TPositionStatusTone;
  readonly label: string;
}

// Not "Closed", which reads as nothing left to do: the liquidity is gone but the money is not,
// and one transaction collects it. Brand tone rather than "warning", which on this surface
// already means out of range.
const PRESENTATION: Record<TUniswapV3RangeStatus, IPositionStatusPresentation> = {
  "in-range": { tone: "success", label: "In range" },
  "out-of-range": { tone: "warning", label: "Out of range" },
  drained: { tone: "brand", label: "To claim" },
  closed: { tone: "neutral", label: "Closed" },
  // A state this build does not recognize says so, the way UnknownPositionBody does for a
  // protocol it cannot render. It claims nothing about the range, which is the point.
  unknown: { tone: "neutral", label: "Unknown state" },
};

export function positionStatusPresentation(status: TUniswapV3RangeStatus): IPositionStatusPresentation {
  return PRESENTATION[status];
}
