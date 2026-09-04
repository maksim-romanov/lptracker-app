import { cn } from "../../utils/cn";
import { rangeToneLabel } from "../labels";
import type { ICardVM, TPositionRangeTone } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// The tone is carried as `color` on the container, so the band's fill, the thumb's halo and the
// out-of-range dot all read it from one place (position-range.css).
// `computeRangeBar` places the thumb from the pool's current tick regardless of status, so a
// closed position renders the same geometry as a live one.
const TONE: Record<TPositionRangeTone, string> = {
  "in-range": "text-success",
  "near-lower": "text-warning",
  "near-upper": "text-warning",
  "out-of-range": "text-error",
  closed: "text-on-surface-variant",
};

type Props = { range: ICardVM["priceRange"]; tone: TPositionRangeTone; class?: string };

const describe = (range: ICardVM["priceRange"], tone: TPositionRangeTone): string =>
  `Price range ${range.minLabel} to ${range.maxLabel} ${range.quoteSymbol} per ${range.baseSymbol}, ` +
  `current price ${range.currentLabel}. ${rangeToneLabel(tone)}.`;

const BOUND = "range-bound font-mono text-caption text-on-surface-variant tabular-nums";

export const PositionRange = ({ range, tone, class: className }: Props) => {
  const closed = tone === "closed";
  return (
    <div
      class={cn("range", TONE[tone], closed && "range-closed", className)}
      role="img"
      aria-label={describe(range, tone)}
      data-controller="range"
      data-range-band-left-value={String(range.bandLeftPct)}
      data-range-band-width-value={String(range.bandWidthPct)}
      data-range-thumb-value={String(range.thumbPct)}
    >
      <span class="range-value font-mono text-caption tabular-nums">{range.currentLabel}</span>

      <span class="range-track">
        <span class={cn("range-band", closed && "range-band-off")} />
        <span class="range-edge range-edge-min" />
        <span class="range-edge range-edge-max" />
        <span class={cn("range-thumb", tone === "out-of-range" && "range-thumb-warn", !closed && "range-thumb-live")} />
      </span>

      <span class={cn(BOUND, "range-bound-min")}>{range.minLabel}</span>
      <span class={cn(BOUND, "range-bound-max")}>{range.maxLabel}</span>
    </div>
  );
};
