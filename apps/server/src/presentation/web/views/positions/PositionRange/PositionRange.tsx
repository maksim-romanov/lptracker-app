import { cn } from "../../utils/cn";
import { rangeToneLabel } from "../labels";
import type { ICardVM, TPositionRangeTone } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// Three states, not five: the band answers "is this earning" — yes, no, or finished. Which bound
// a live position is drifting toward is a qualifier on that yes, and it belongs to the badge
// beside the pair, which is where the reader is already looking for the state in words.
// It used to have its own colour here, and the result was a board where most rows were amber:
// one-sided liquidity starts at spot by construction, so it sits at its lower bound as a matter
// of design, not as a thing going wrong. A warning that is always on is not a warning, and at
// the size of this bar it drowns the two states that do differ.
// The tone is carried as `color` on the container, so the band's fill, the thumb's halo and the
// out-of-range dot all read it from one place (position-range.css).
// The closed band is drawn as a flat neutral fill. `computeRangeBar` places the thumb from the
// pool's current tick whatever the status, so a closed position is geometrically identical to a
// live one and the hue would otherwise be the only thing separating them.
const TONE: Record<TPositionRangeTone, string> = {
  "in-range": "text-success",
  "near-lower": "text-success",
  "near-upper": "text-success",
  "out-of-range": "text-error",
  closed: "text-on-surface-variant",
};

type Props = { range: ICardVM["priceRange"]; tone: TPositionRangeTone; class?: string };

// One image with one sentence: the internals are three numbers pinned to percentages, which a
// screen reader would otherwise announce as a bare list with no idea which is which.
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
