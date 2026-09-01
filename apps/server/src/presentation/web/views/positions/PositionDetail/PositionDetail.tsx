import type { Child } from "hono/jsx";

import { Icon } from "../../components/Icon/Icon";
import { NetworkLogo } from "../../components/NetworkLogo/NetworkLogo";
import { explorerAddressUrl, networkLabel, uniswapPositionUrl } from "../../networks";
import { pairLabel } from "../labels";
import { PositionAmounts } from "../PositionAmounts/PositionAmounts";
import { PositionRange } from "../PositionRange/PositionRange";
import { PositionStatus } from "../PositionStatus/PositionStatus";
import { ProtocolBadge } from "../ProtocolBadge/ProtocolBadge";
import { TokenIcon } from "../TokenIcon/TokenIcon";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

const shortenAddress = (address: string) => (address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address);

const Spec = ({ label, children }: { label: string; children: Child }) => (
  <div class="flex items-baseline justify-between gap-4 text-body-small">
    <dt class="text-on-surface-variant">{label}</dt>
    <dd class="text-right font-mono text-figure-small">{children}</dd>
  </div>
);

export const PositionDetail = ({ card }: { card: ICardVM }) => {
  const range = card.priceRange;
  return (
    <>
      <header class="flex items-center gap-3">
        <span class="flex -space-x-2">
          <TokenIcon url={card.pair.base.iconUrl} symbol={card.pair.base.symbol} class="h-8 w-8 rounded-full" />
          <TokenIcon url={card.pair.quote.iconUrl} symbol={card.pair.quote.symbol} class="h-8 w-8 rounded-full" />
        </span>
        <div class="flex min-w-0 flex-col gap-1">
          <span class="text-headline">{pairLabel(card.pair)}</span>
          <span class="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-on-surface-variant">
            <ProtocolBadge protocol={card.protocol} />
            <span class="font-mono">{card.feeTierLabel}</span>
            <PositionStatus tone={card.rangeTone} />
          </span>
        </div>
      </header>

      <section class="flex flex-col gap-2 border-outline-variant border-t pt-4">
        <h3 class="text-caption text-on-surface-variant">Price range</h3>
        <PositionRange range={range} tone={card.rangeTone} />
        <p class="text-body-small text-on-surface-variant">
          Priced in {range.quoteSymbol} per {range.baseSymbol}.
        </p>
      </section>

      <section class="flex flex-col gap-2 border-outline-variant border-t pt-4">
        <h3 class="text-caption text-on-surface-variant">Amounts</h3>
        <PositionAmounts card={card} />
      </section>

      <dl class="flex flex-col gap-2 border-outline-variant border-t pt-4">
        <Spec label="Wallet">{shortenAddress(card.ownerAddress)}</Spec>
        <div class="flex items-baseline justify-between gap-4 text-body-small">
          <dt class="text-on-surface-variant">Network</dt>
          <dd class="flex items-center gap-1.5">
            <NetworkLogo chainId={card.chainId} size={14} />
            {networkLabel(card.chainId)}
          </dd>
        </div>
        {card.openedAtLabel && <Spec label="Opened">{card.openedAtLabel}</Spec>}
        <Spec label="Position">#{card.nftTokenId}</Spec>
        <Spec label="Pool">
          <a
            href={explorerAddressUrl(card.chainId, card.poolAddress)}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 hover:text-primary-text"
          >
            {shortenAddress(card.poolAddress)}
            <Icon name="external" size={12} />
          </a>
        </Spec>
      </dl>

      <div class="flex justify-end border-outline-variant border-t pt-4">
        <a
          href={uniswapPositionUrl(card.chainId, card.nftTokenId)}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-full border border-outline px-4 py-2 text-button"
        >
          View on Uniswap
          <Icon name="external" size={15} />
        </a>
      </div>
    </>
  );
};
