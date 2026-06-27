export type TUniswapV3RangeStatus = "in-range" | "out-of-range" | "closed";

const STATUS_MAP: Record<string, TUniswapV3RangeStatus> = {
  "in-range": "in-range",
  "out-of-range": "out-of-range",
  closed: "closed",
  open: "in-range",
};

export function deriveStatus(state: string): TUniswapV3RangeStatus {
  return STATUS_MAP[state] ?? "in-range";
}
