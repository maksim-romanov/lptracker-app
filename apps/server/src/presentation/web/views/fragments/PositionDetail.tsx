import type { TUniswapV3RangeStatus } from "@depthly/protocol-math/uniswap-v3";

import type { ICardVM } from "../../../../features/uniswap-v3/presentation/web/position.web-mapper";
import { IconExternal } from "../Icons";
import { NetworkLogo } from "../NetworkLogo";
import { explorerAddressUrl, networkKey, networkLabel, uniswapPositionUrl } from "../networks";

const STATUS: Record<TUniswapV3RangeStatus, { label: string; cls: string }> = {
  "in-range": { label: "In range", cls: "badge-success" },
  "out-of-range": { label: "Out of range", cls: "badge-error" },
  closed: { label: "Closed", cls: "badge-ghost" },
};

const TokenIcon = ({ url, symbol }: { url: string; symbol: string }) =>
  url ? <img src={url} alt={symbol} class="token-icon" loading="lazy" /> : <span class="token-icon is-fallback">{symbol.slice(0, 1)}</span>;

const shortenAddress = (addr: string) => (addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr);

export const PositionDetail = ({ card }: { card: ICardVM }) => {
  const status = STATUS[card.status];
  const range = card.priceRange;
  return (
    <>
      <header class="head">
        <span class="token-stack">
          <TokenIcon url={card.pair.base.iconUrl} symbol={card.pair.base.symbol} />
          <TokenIcon url={card.pair.quote.iconUrl} symbol={card.pair.quote.symbol} />
        </span>
        <div class="titles">
          <div class="pair">
            {card.pair.base.symbol} / {card.pair.quote.symbol}
          </div>
          <div class="meta">{card.feeTierLabel} fee tier</div>
        </div>
      </header>

      <div class="tags">
        <span class={`badge badge-sm ${status.cls}`}>{status.label}</span>
        <span class={`badge badge-sm net-tag net-tag--${networkKey(card.chainId)}`}>
          <NetworkLogo chainId={card.chainId} size={14} />
          {networkLabel(card.chainId)}
        </span>
        <span class="badge badge-sm proto-tag proto-tag--uniswap">{card.protocolLabel}</span>
      </div>

      <section class="range-block">
        <div class="range-head">
          <span class="stat-label">Price range</span>
          <span class="range-now nums">
            {range.currentLabel} {range.quoteSymbol}
          </span>
        </div>
        <div
          class="range-bar"
          data-controller="range"
          data-band-left={String(range.bandLeftPct)}
          data-band-width={String(range.bandWidthPct)}
          data-thumb={String(range.thumbPct)}
          data-inrange={String(range.inRange)}
        >
          <span class="band" />
          <span class="thumb" />
        </div>
        <div class="range-labels nums">
          <span>{range.minLabel}</span>
          <span>{range.maxLabel}</span>
        </div>
      </section>

      <section class="group">
        <div class="stat-label">Principal</div>
        <dl class="rows">
          {card.principal.map((p) => (
            <div class="stat-row">
              <dt>{p.symbol}</dt>
              <dd class="nums">{p.formatted}</dd>
            </div>
          ))}
        </dl>
      </section>

      {card.fees.length > 0 && (
        <section class="group">
          <div class="stat-label">Unclaimed fees</div>
          <dl class="rows">
            {card.fees.map((f) => (
              <div class="stat-row">
                <dt>{f.symbol}</dt>
                <dd class="nums">{f.formatted}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <footer class="foot">
        <span class="stat-label">Pool</span>
        <a href={explorerAddressUrl(card.chainId, card.poolAddress)} target="_blank" rel="noopener noreferrer" class="addr">
          {shortenAddress(card.poolAddress)}
          <IconExternal size={12} />
        </a>
      </footer>

      <div class="actions">
        <a href={uniswapPositionUrl(card.chainId, card.nftTokenId)} target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
          View on Uniswap
          <IconExternal size={15} />
        </a>
      </div>
    </>
  );
};
