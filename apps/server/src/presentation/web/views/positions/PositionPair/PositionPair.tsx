import { NetworkLogo } from "../../components/NetworkLogo/NetworkLogo";
import { networkLabel } from "../../networks";
import { pairLabel } from "../labels";
import { TokenIcon } from "../TokenIcon/TokenIcon";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

type Props = { pair: ICardVM["pair"]; feeTierLabel: string; chainId: number };

// The network rides the icon cluster as a badge instead of holding a column of its own:
// it repeats for nearly every row, so it earns a corner rather than a sixth of the table.
// It stays a full word for assistive tech, where the badge is nothing but an unnamed mark.
// The fee tier trails the name on the same line — as a second line it doubled the height
// of every row for a value that is a qualifier of the pair, not a field beside it.
export const PositionPair = ({ pair, feeTierLabel, chainId }: Props) => (
  <div class="flex items-center gap-2.5">
    <span class="relative flex shrink-0">
      <span class="flex -space-x-2">
        <TokenIcon
          url={pair.base.iconUrl}
          symbol={pair.base.symbol}
          class="h-5 w-5 rounded-full ring-2 ring-[color:var(--item-bg,var(--color-surface))]"
        />
        <TokenIcon
          url={pair.quote.iconUrl}
          symbol={pair.quote.symbol}
          class="h-5 w-5 rounded-full ring-2 ring-[color:var(--item-bg,var(--color-surface))]"
        />
      </span>
      <span class="absolute -right-1 -bottom-1 flex rounded-full bg-[var(--item-bg,var(--color-surface))] ring-2 ring-[color:var(--item-bg,var(--color-surface))]">
        <NetworkLogo chainId={chainId} size={14} />
      </span>
    </span>
    <span class="flex min-w-0 items-baseline gap-2">
      <span class="truncate font-medium">{pairLabel(pair)}</span>
      <span class="shrink-0 text-on-surface-variant text-xs">
        {feeTierLabel}
        <span class="sr-only"> fee tier on {networkLabel(chainId)}</span>
      </span>
    </span>
  </div>
);
