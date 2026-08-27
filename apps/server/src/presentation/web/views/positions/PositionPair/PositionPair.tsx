import { pairLabel } from "../labels";
import { TokenIcon } from "../TokenIcon/TokenIcon";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

export const PositionPair = ({ pair, feeTierLabel }: { pair: ICardVM["pair"]; feeTierLabel: string }) => (
  <div class="flex items-center gap-2">
    <span class="flex -space-x-2">
      <TokenIcon url={pair.base.iconUrl} symbol={pair.base.symbol} class="h-6 w-6" />
      <TokenIcon url={pair.quote.iconUrl} symbol={pair.quote.symbol} class="h-6 w-6" />
    </span>
    <span class="flex flex-col">
      <span>{pairLabel(pair)}</span>
      <span>{feeTierLabel}</span>
    </span>
  </div>
);
