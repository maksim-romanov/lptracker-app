import type { ICardVM } from "../../../../../features/uniswap-v3/presentation/web/position.web-mapper";

export const PositionRange = ({ range }: { range: ICardVM["priceRange"] }) => (
  <div
    class="relative h-1.5 rounded-full bg-surface-variant"
    data-controller="range"
    data-band-left={String(range.bandLeftPct)}
    data-band-width={String(range.bandWidthPct)}
    data-thumb={String(range.thumbPct)}
    data-inrange={String(range.inRange)}
  >
    <span class="absolute inset-y-0 rounded-full bg-on-surface/30 left-[var(--band-left)] w-[var(--band-width)]" />
    <span class="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-outline bg-surface left-[var(--thumb)]" />
  </div>
);
