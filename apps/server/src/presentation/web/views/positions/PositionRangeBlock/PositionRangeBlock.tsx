import { PositionRange } from "../PositionRange/PositionRange";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

export const PositionRangeBlock = ({ range }: { range: ICardVM["priceRange"] }) => (
  <div class="flex flex-col gap-1">
    <div class="text-sm">
      {range.currentLabel} {range.quoteSymbol}
    </div>
    <PositionRange range={range} />
    <div class="flex justify-between gap-2 text-sm">
      <span>{range.minLabel}</span>
      <span>{range.maxLabel}</span>
    </div>
  </div>
);
