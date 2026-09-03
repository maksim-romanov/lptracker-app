import { NetworkLogo } from "../../components/NetworkLogo/NetworkLogo";
import { networkLabel } from "../../networks";
import { cn } from "../../utils/cn";
import { pairLabel } from "../labels";
import { PositionInvert } from "../PositionInvert/PositionInvert";
import { PositionStatus } from "../PositionStatus/PositionStatus";
import { ProtocolBadge } from "../ProtocolBadge/ProtocolBadge";
import { TokenIcon } from "../TokenIcon/TokenIcon";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// The network rides the icon cluster as a badge instead of holding a column of its own: it
// repeats for nearly every row, so it earns a corner rather than a fifth of the table. It is a
// chain's own mark, not a swatch, so it is identifiable by shape as well as hue — and it stays a
// full word for assistive tech, where the badge is nothing but an unnamed image.
// Protocol, fee tier and state share the second line. The Range cell is three lines tall either
// way, so this costs no row height, and it puts the three qualifiers of a position where its
// name is rather than scattered across the row.
const ICON = "h-8 w-8 rounded-full ring-2 ring-[color:var(--item-bg,var(--color-surface))]";

// Same cut-out as the token marks: an opaque fill plus a ring in whatever the item's background
// currently is, so hover changes the colour they are cut from rather than showing a seam.
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
      {/* Never wraps: the row's height must not depend on how long a status happens to be
          called, and "Near upper bound" was pushing its own row 10px taller than its
          neighbours. The protocol name is the one part that gives way. */}
      <span class="flex min-w-0 items-center gap-x-2 text-caption text-on-surface-variant">
        <ProtocolBadge protocol={card.protocol} />
        <span class="shrink-0 font-mono">{card.feeTierLabel}</span>
        <PositionStatus tone={card.rangeTone} />
      </span>
    </span>
  </div>
);
