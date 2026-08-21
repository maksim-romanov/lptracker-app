import type { TUniswapV3RangeStatus } from "@depthly/protocol-math/uniswap-v3";

import type { ICardVM } from "../../../../features/uniswap-v3/presentation/web/position.web-mapper";
import { IconInvert } from "../Icons";

const TokenIcon = ({ url, symbol }: { url: string; symbol: string }) =>
  url ? (
    <img src={url} alt={symbol} loading="lazy" class="h-6 w-6 rounded-full" />
  ) : (
    <span class="h-6 w-6 rounded-full border border-outline">{symbol.slice(0, 1)}</span>
  );

const STATUS: Record<TUniswapV3RangeStatus, string> = {
  "in-range": "In range",
  "out-of-range": "Out of range",
  closed: "Closed",
};

export const PositionCard = ({ card }: { card: ICardVM }) => {
  const range = card.priceRange;
  return (
    <article
      class="position-card @container flex flex-col gap-3 rounded-md border border-outline p-4 @md:flex-row @md:items-center @md:gap-4"
      tabindex={0}
      aria-haspopup="dialog"
      aria-label={`View ${card.pair.base.symbol} / ${card.pair.quote.symbol} details`}
      hx-get={`/positions/${card.ref}/detail?inverted=${card.inverted ? "1" : "0"}`}
      hx-target="#position-modal-box"
      hx-swap="innerHTML"
      hx-indicator="#position-modal-loading"
      hx-trigger="click"
    >
      <div class="flex items-center gap-2 @md:flex-1">
        <span class="flex -space-x-2">
          <TokenIcon url={card.pair.base.iconUrl} symbol={card.pair.base.symbol} />
          <TokenIcon url={card.pair.quote.iconUrl} symbol={card.pair.quote.symbol} />
        </span>
        <div class="flex flex-col">
          <span>
            {card.pair.base.symbol} / {card.pair.quote.symbol}
          </span>
          <span>{card.feeTierLabel}</span>
        </div>
      </div>

      <div class="flex flex-col gap-1 @md:flex-1">
        <div class="flex justify-between gap-2 text-sm">
          <span>
            {range.currentLabel} {range.quoteSymbol}
          </span>
        </div>
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
        <div class="flex justify-between gap-2 text-sm">
          <span>{range.minLabel}</span>
          <span>{range.maxLabel}</span>
        </div>
      </div>

      <dl class="flex flex-col gap-1 @md:flex-1">
        {card.principal.map((p) => (
          <div class="flex justify-between gap-2">
            <dt>{p.symbol}</dt>
            <dd>{p.formatted}</dd>
          </div>
        ))}
      </dl>

      <div class="flex items-center">
        <span class="rounded-sm border border-outline px-2 py-0.5 text-xs">{STATUS[card.status]}</span>
      </div>

      <button
        type="button"
        data-invert={card.ref}
        hx-get={`/positions/${card.ref}/card`}
        hx-target="closest .position-card"
        hx-swap="outerHTML"
        hx-trigger="click consume"
        hx-indicator="this"
        aria-label="Invert price"
        class="self-start rounded-sm border border-outline p-1.5 @md:self-center"
      >
        <IconInvert size={16} />
      </button>
    </article>
  );
};
