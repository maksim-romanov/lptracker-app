import type { Child } from "hono/jsx";

import { Icon } from "../../components/Icon/Icon";
import { NetworkLogo } from "../../components/NetworkLogo/NetworkLogo";
import { explorerAddressUrl, networkLabel, uniswapPositionUrl } from "../../networks";
import { cn } from "../../utils/cn";
import { pairLabel, shortenAddress } from "../labels";
import { PositionAmounts } from "../PositionAmounts/PositionAmounts";
import { PositionInvert } from "../PositionInvert/PositionInvert";
import { PositionRange } from "../PositionRange/PositionRange";
import { PositionStatus } from "../PositionStatus/PositionStatus";
import { ProtocolBadge } from "../ProtocolBadge/ProtocolBadge";
import { TokenIcon } from "../TokenIcon/TokenIcon";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// One shell for every row, including the one with a chain mark in it. Written by hand, that row
// sat two pixels above its own label and broke the rhythm the other four kept.
const Spec = ({ label, mono = true, children }: { label: string; mono?: boolean; children: Child }) => (
  <div class="flex items-center justify-between gap-4 text-body-small">
    <dt class="text-on-surface-variant">{label}</dt>
    <dd class={cn("flex items-center justify-end gap-1.5 text-right", mono && "font-mono text-figure-small")}>{children}</dd>
  </div>
);

// Every address in this panel is a destination, and they all take the same shape: the shortened
// form to read, the whole thing on hover, and the explorer a click away.
const ExplorerLink = ({ chainId, address }: { chainId: number; address: string }) => (
  <a
    href={explorerAddressUrl(chainId, address)}
    target="_blank"
    rel="noopener noreferrer"
    data-tooltip={address}
    class="inline-flex items-center gap-1 hover:text-primary-text"
  >
    {shortenAddress(address)}
    <Icon name="external" size={12} />
  </a>
);

export const PositionDetail = ({ card }: { card: ICardVM }) => {
  const range = card.priceRange;
  return (
    <>
      <header class="flex items-center gap-3">
        <span class="flex -space-x-2">
          <TokenIcon
            url={card.pair.base.iconUrl}
            symbol={card.pair.base.symbol}
            tokenRef={card.pair.base.tokenRef}
            class="h-8 w-8 rounded-full"
          />
          <TokenIcon
            url={card.pair.quote.iconUrl}
            symbol={card.pair.quote.symbol}
            tokenRef={card.pair.quote.tokenRef}
            class="h-8 w-8 rounded-full"
          />
        </span>
        <div class="group flex min-w-0 flex-col gap-1">
          <span class="flex items-center gap-1">
            <span class="truncate text-headline">{pairLabel(card.pair)}</span>
            <PositionInvert card={card} surface="detail" />
          </span>
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
        <PositionAmounts card={card} withContract />
      </section>

      <dl class="flex flex-col gap-2 border-outline-variant border-t pt-4">
        <Spec label="Wallet">
          <ExplorerLink chainId={card.chainId} address={card.ownerAddress} />
        </Spec>
        <Spec label="Network" mono={false}>
          <NetworkLogo chainId={card.chainId} size={14} />
          {networkLabel(card.chainId)}
        </Spec>
        {card.openedAtLabel && <Spec label="Opened">{card.openedAtLabel}</Spec>}
        <Spec label="Position">#{card.nftTokenId}</Spec>
        <Spec label="Pool">
          <ExplorerLink chainId={card.chainId} address={card.poolAddress} />
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
