import { cn } from "../../utils/cn";
import type { ICardVM, TPositionRangeTone } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// Out of range earns the error role rather than warning: the position has stopped
// accruing fees, while warning is what a position still earning but close to its bound
// gets, and the two need to be told apart at a glance.
// The closed band is drawn hollow. `computeRangeBar` places the tick from the pool's
// current tick whatever the status, so a closed position is geometrically identical to a
// live one and the hue is otherwise the only thing separating them.
const TONE: Record<TPositionRangeTone, { band: string; tick: string }> = {
  "in-range": { band: "bg-success/25", tick: "bg-success" },
  "near-lower": { band: "bg-warning/25", tick: "bg-warning" },
  "near-upper": { band: "bg-warning/25", tick: "bg-warning" },
  "out-of-range": { band: "bg-error/25", tick: "bg-error" },
  closed: { band: "border border-on-surface-variant/60", tick: "bg-on-surface-variant" },
};

type Props = { range: ICardVM["priceRange"]; tone: TPositionRangeTone; class?: string };

// Carries no text: whoever renders it names the status next to it. The tick overshoots
// the band, so the box is taller than either and everything is centred against it.
export const PositionRange = ({ range, tone, class: className }: Props) => {
  const colors = TONE[tone];
  return (
    <div
      class={cn("relative h-4 w-full", className)}
      data-controller="range"
      data-range-band-left-value={String(range.bandLeftPct)}
      data-range-band-width-value={String(range.bandWidthPct)}
      data-range-thumb-value={String(range.thumbPct)}
    >
      <span class="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-outline" />
      <span class={cn("absolute top-1/2 left-[var(--band-left)] h-2 w-[var(--band-width)] -translate-y-1/2 rounded-full", colors.band)} />
      <span class={cn("absolute top-1/2 left-[var(--thumb)] h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full", colors.tick)} />
    </div>
  );
};
