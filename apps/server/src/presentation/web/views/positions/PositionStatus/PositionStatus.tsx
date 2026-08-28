import { cn } from "../../utils/cn";
import { rangeToneLabel } from "../labels";
import type { TPositionRangeTone } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// The swatch repeats the bar's colour, and the closed one is hollow for the same reason
// the closed band is: that state has no geometry of its own to be read from.
// Colour rides the dot rather than the label because these roles are fills — as 12px
// text on the light surface they land between 2.2:1 and 4.1:1, under the 4.5:1 a label
// has to clear. The word beside it is what carries the state; the dot only echoes it.
const DOT: Record<TPositionRangeTone, string> = {
  "in-range": "bg-success",
  "near-lower": "bg-warning",
  "near-upper": "bg-warning",
  "out-of-range": "bg-error",
  closed: "border border-on-surface-variant",
};

export const PositionStatus = ({ tone, class: className }: { tone: TPositionRangeTone; class?: string }) => (
  <span class={cn("flex items-center gap-1.5 text-on-surface-variant text-xs", className)}>
    <span aria-hidden="true" class={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT[tone])} />
    {rangeToneLabel(tone)}
  </span>
);
