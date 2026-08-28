import { PositionRange } from "../PositionRange/PositionRange";
import { PositionStatus } from "../PositionStatus/PositionStatus";
import type { ICardVM, TPositionRangeTone } from "#features/uniswap-v3/presentation/web/position.web-mapper";

export const PositionRangeBlock = ({ range, tone }: { range: ICardVM["priceRange"]; tone: TPositionRangeTone }) => (
  <div class="flex flex-col gap-1.5">
    <div class="flex items-baseline justify-between gap-2">
      <PositionStatus tone={tone} />
      <span class="text-sm tabular-nums">
        {range.currentLabel} {range.quoteSymbol}
      </span>
    </div>
    <PositionRange range={range} tone={tone} />
    <div class="flex justify-between gap-2 text-on-surface-variant text-xs tabular-nums">
      <span>{range.minLabel}</span>
      <span>{range.maxLabel}</span>
    </div>
  </div>
);
