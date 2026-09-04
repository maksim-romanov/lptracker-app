import { NetworkLogo } from "../../components/NetworkLogo/NetworkLogo";
import { networkLabel } from "../../networks";
import { cn } from "../../utils/cn";
import { pairLabel } from "../labels";
import { PositionInvert } from "../PositionInvert/PositionInvert";
import { PositionStatus } from "../PositionStatus/PositionStatus";
import { ProtocolBadge } from "../ProtocolBadge/ProtocolBadge";
import { TokenIcon } from "../TokenIcon/TokenIcon";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

const ICON = "h-8 w-8 rounded-full ring-2 ring-[color:var(--item-bg,var(--color-surface))]";

const BADGE = "flex rounded-full bg-[var(--item-bg,var(--color-surface))] ring-2 ring-[color:var(--item-bg,var(--color-surface))]";

export const PositionPair = ({ card }: { card: ICardVM }) => (
  <div class="flex items-center gap-3">
    <span class="relative flex shrink-0">
      <span class="flex -space-x-3">
        <TokenIcon url={card.pair.base.iconUrl} symbol={card.pair.base.symbol} tokenRef={card.pair.base.tokenRef} class={ICON} />
        <TokenIcon url={card.pair.quote.iconUrl} symbol={card.pair.quote.symbol} tokenRef={card.pair.quote.tokenRef} class={ICON} />
      </span>
      <span class={cn(BADGE, "absolute -right-0.5 -bottom-0.5")}>
        <NetworkLogo chainId={card.chainId} size={16} />
      </span>
    </span>

    <span class="flex min-w-0 flex-col gap-1">
      <span class="flex items-center gap-1">
        <span class="truncate text-headline">
          {pairLabel(card.pair)}
          <span class="sr-only"> on {networkLabel(card.chainId)}</span>
        </span>
        <PositionInvert card={card} />
      </span>
      {/* The status text never wraps — a row's height must not depend on how long the status
          label is. The protocol name is the part that gives way instead. */}
      <span class="flex min-w-0 items-center gap-x-2 text-caption text-on-surface-variant">
        <ProtocolBadge protocol={card.protocol} />
        <span class="shrink-0 font-mono">{card.feeTierLabel}</span>
        <PositionStatus tone={card.rangeTone} />
      </span>
    </span>
  </div>
);
