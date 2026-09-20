export type TUniswapV3RangeStatus = "in-range" | "out-of-range" | "drained" | "closed" | "unknown";

// Every state the v3 contract mapper emits. A state outside them gets its own name rather than
// the one guess available — "in-range" — which would paint a position that earns nothing as
// live. The function is total by contract: a shared mapper cannot know whether the caller that
// resolves a state can contain a throw, so it never throws and names the gap instead.
const STATUS_MAP: Record<string, TUniswapV3RangeStatus | undefined> = {
  "in-range": "in-range",
  "out-of-range": "out-of-range",
  drained: "drained",
  closed: "closed",
};

export function deriveStatus(state: string): TUniswapV3RangeStatus {
  return STATUS_MAP[state] ?? "unknown";
}
