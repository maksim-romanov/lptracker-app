import type { TUniswapV3RangeStatus } from "@depthly/protocol-math/uniswap-v3";

import type { ICardVM } from "../../../../features/uniswap-v3/presentation/web/position.web-mapper";
import { IconExternal } from "../Icons";
import { NetworkLogo } from "../NetworkLogo";
import { explorerAddressUrl, networkLabel, uniswapPositionUrl } from "../networks";

const STATUS: Record<TUniswapV3RangeStatus, string> = {
  "in-range": "In range",
  "out-of-range": "Out of range",
  closed: "Closed",
};

const TokenIcon = ({ url, symbol }: { url: string; symbol: string }) =>
  url ? (
    <img src={url} alt={symbol} loading="lazy" class="h-8 w-8 rounded-full" />
  ) : (
    <span class="h-8 w-8 rounded-full border border-outline">{symbol.slice(0, 1)}</span>
  );

const shortenAddress = (addr: string) => (addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr);

export const PositionDetail = ({ card }: { card: ICardVM }) => {
  const range = card.priceRange;
  return (
    <>
      <header class="flex items-center gap-3 border-b border-outline pb-3">
        <span class="flex -space-x-2">
          <TokenIcon url={card.pair.base.iconUrl} symbol={card.pair.base.symbol} />
          <TokenIcon url={card.pair.quote.iconUrl} symbol={card.pair.quote.symbol} />
        </span>
        <div class="flex flex-col">
          <div>
            {card.pair.base.symbol} / {card.pair.quote.symbol}
          </div>
          <div>{card.feeTierLabel} fee tier</div>
        </div>
      </header>

      <div class="flex flex-wrap gap-2 border-b border-outline pb-3">
        <span class="rounded-sm border border-outline px-2 py-0.5 text-xs">{STATUS[card.status]}</span>
        <span class="flex items-center gap-1 rounded-sm border border-outline px-2 py-0.5 text-xs">
          <NetworkLogo chainId={card.chainId} size={14} />
          {networkLabel(card.chainId)}
        </span>
        <span class="rounded-sm border border-outline px-2 py-0.5 text-xs">{card.protocolLabel}</span>
      </div>

      <section class="flex flex-col gap-2 border-b border-outline pb-3">
        <div class="flex justify-between gap-2 text-sm">
          <span>Price range</span>
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
      </section>

      <section class="flex flex-col gap-2 border-b border-outline pb-3">
        <div class="text-sm">Principal</div>
        <dl class="flex flex-col gap-1">
          {card.principal.map((p) => (
            <div class="flex justify-between gap-2">
              <dt>{p.symbol}</dt>
              <dd>{p.formatted}</dd>
            </div>
          ))}
        </dl>
      </section>

      {card.fees.length > 0 && (
        <section class="flex flex-col gap-2 border-b border-outline pb-3">
          <div class="text-sm">Unclaimed fees</div>
          <dl class="flex flex-col gap-1">
            {card.fees.map((f) => (
              <div class="flex justify-between gap-2">
                <dt>{f.symbol}</dt>
                <dd>{f.formatted}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <footer class="flex items-center justify-between gap-2 border-b border-outline pb-3">
        <span class="text-sm">Pool</span>
        <a href={explorerAddressUrl(card.chainId, card.poolAddress)} target="_blank" rel="noopener noreferrer" class="flex items-center gap-1">
          {shortenAddress(card.poolAddress)}
          <IconExternal size={12} />
        </a>
      </footer>

      <div class="flex justify-end">
        <a
          href={uniswapPositionUrl(card.chainId, card.nftTokenId)}
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1 rounded-sm border border-outline px-3 py-2"
        >
          View on Uniswap
          <IconExternal size={15} />
        </a>
      </div>
    </>
  );
};
