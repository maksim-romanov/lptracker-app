import type { TUniswapV3RangeStatus } from "@depthly/protocol-math/uniswap-v3";

import type { ICardVM } from "../../../../features/uniswap-v3/presentation/web/position.web-mapper";
import { IconInvert } from "../Icons";

const TokenIcon = ({ url, symbol }: { url: string; symbol: string }) =>
  url ? <img src={url} alt={symbol} class="token-icon" loading="lazy" /> : <span class="token-icon is-fallback">{symbol.slice(0, 1)}</span>;

const STATUS: Record<TUniswapV3RangeStatus, { label: string; cls: string }> = {
  "in-range": { label: "In range", cls: "badge-success" },
  "out-of-range": { label: "Out of range", cls: "badge-error" },
  closed: { label: "Closed", cls: "badge-ghost" },
};

export const PositionCard = ({ card }: { card: ICardVM }) => {
  const status = STATUS[card.status];
  const range = card.priceRange;
  return (
    <article
      class="position-card"
      tabindex={0}
      aria-haspopup="dialog"
      aria-label={`View ${card.pair.base.symbol} / ${card.pair.quote.symbol} details`}
      hx-get={`/positions/${card.ref}/detail?inverted=${card.inverted ? "1" : "0"}`}
      hx-target="#position-modal-box"
      hx-swap="innerHTML"
      hx-indicator="#position-modal-loading"
      hx-trigger="click"
    >
      <header class="head">
        <span class="token-stack">
          <TokenIcon url={card.pair.base.iconUrl} symbol={card.pair.base.symbol} />
          <TokenIcon url={card.pair.quote.iconUrl} symbol={card.pair.quote.symbol} />
        </span>
        <button
          type="button"
          data-invert={card.ref}
          hx-get={`/positions/${card.ref}/card`}
          hx-target="closest .position-card"
          hx-swap="outerHTML"
          hx-trigger="click consume"
          hx-indicator="this"
          aria-label="Invert price"
          class="btn btn-soft btn-sm btn-square invert"
        >
          <IconInvert size={16} />
        </button>
      </header>

      <div class="title">
        <span class="pair">
          {card.pair.base.symbol} / {card.pair.quote.symbol}
        </span>
        <span class="fee">{card.feeTierLabel}</span>
      </div>

      <span class={`badge badge-sm status ${status.cls}`}>{status.label}</span>

      <dl class="metrics">
        <div class="stat-row">
          <dt>Range</dt>
          <dd class="nums">
            {range.minLabel} – {range.maxLabel}
          </dd>
        </div>
        <div class="stat-row">
          <dt>Current</dt>
          <dd class="nums">
            {range.currentLabel} {range.quoteSymbol}
          </dd>
        </div>
        {card.principal.map((p) => (
          <div class="stat-row">
            <dt>{p.symbol}</dt>
            <dd class="nums">{p.formatted}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
};
