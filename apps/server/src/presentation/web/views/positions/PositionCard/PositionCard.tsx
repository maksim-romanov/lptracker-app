import type { TUniswapV3RangeStatus } from "@depthly/protocol-math/uniswap-v3";

import type { ICardVM } from "../../../../../features/uniswap-v3/presentation/web/position.web-mapper";
import { Button } from "../../components/Button/Button";
import { Icon } from "../../components/Icon/Icon";
import { Tag } from "../../components/Tag/Tag";
import { PositionRange } from "../PositionRange/PositionRange";
import { TokenIcon } from "../TokenIcon/TokenIcon";

const STATUS: Record<TUniswapV3RangeStatus, string> = {
  "in-range": "In range",
  "out-of-range": "Out of range",
  closed: "Closed",
};

export const PositionCard = ({ card }: { card: ICardVM }) => {
  const range = card.priceRange;
  return (
    // transition:false avoids globalViewTransitions cross-fading the whole page (application.ts).
    <article
      class="position-card @container flex cursor-pointer @md:flex-row flex-col @md:items-center @md:gap-4 gap-3 rounded-md border border-outline p-4"
      tabindex={0}
      data-controller="card"
      // htmx compiles hx-trigger key filters with `new Function`, which script-src 'self'
      // forbids; Stimulus matches against a lookup table, so the filter survives the CSP.
      data-action="keydown.enter->card#open:prevent keydown.space->card#open:prevent"
      aria-haspopup="dialog"
      aria-label={`View ${card.pair.base.symbol} / ${card.pair.quote.symbol} details`}
      hx-get={`/positions/${card.ref}/detail?inverted=${card.inverted ? "1" : "0"}`}
      hx-target="#position-modal-box"
      hx-swap="innerHTML transition:false"
      hx-indicator="#position-toast-loading"
      hx-trigger="click"
    >
      <div class="flex @md:flex-1 items-center gap-2">
        <span class="sr-only">Pool:</span>
        <span class="flex -space-x-2">
          <TokenIcon url={card.pair.base.iconUrl} symbol={card.pair.base.symbol} class="h-6 w-6" />
          <TokenIcon url={card.pair.quote.iconUrl} symbol={card.pair.quote.symbol} class="h-6 w-6" />
        </span>
        <div class="flex flex-col">
          <span>
            {card.pair.base.symbol} / {card.pair.quote.symbol}
          </span>
          <span>{card.feeTierLabel}</span>
        </div>
      </div>

      <div class="flex @md:flex-1 flex-col gap-1">
        <span class="sr-only">Range:</span>
        <div class="flex justify-between gap-2 text-sm">
          <span>
            {range.currentLabel} {range.quoteSymbol}
          </span>
        </div>
        <PositionRange range={range} />
        <div class="flex justify-between gap-2 text-sm">
          <span>{range.minLabel}</span>
          <span>{range.maxLabel}</span>
        </div>
      </div>

      <dl aria-label="Principal" class="flex @md:flex-1 flex-col gap-1">
        {card.principal.map((p) => (
          <div class="flex justify-between gap-2">
            <dt>{p.symbol}</dt>
            <dd>{p.formatted}</dd>
          </div>
        ))}
      </dl>

      <div class="flex items-center">
        <span class="sr-only">Status:</span>
        <Tag>{STATUS[card.status]}</Tag>
      </div>

      <Button
        data-invert={card.ref}
        hx-get={`/positions/${card.ref}/card`}
        hx-target="closest .position-card"
        hx-swap="outerHTML"
        hx-trigger="click consume"
        hx-indicator="this"
        aria-label="Invert price"
        class="self-start @md:self-center p-1.5"
      >
        <Icon name="invert" size={16} />
      </Button>
    </article>
  );
};
