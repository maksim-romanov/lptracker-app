import type { ICardVM } from "../../../../../features/uniswap-v3/presentation/web/position.web-mapper";

export const PositionRange = ({ range }: { range: ICardVM["priceRange"] }) => (
  <div
    class="relative h-1.5 rounded-full bg-surface-variant"
    data-controller="range"
    data-range-band-left-value={String(range.bandLeftPct)}
    data-range-band-width-value={String(range.bandWidthPct)}
    data-range-thumb-value={String(range.thumbPct)}
  >
    <span class="absolute inset-y-0 left-[var(--band-left)] w-[var(--band-width)] rounded-full bg-on-surface/30" />
    <span class="absolute top-1/2 left-[var(--thumb)] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-outline bg-surface" />
  </div>
);
