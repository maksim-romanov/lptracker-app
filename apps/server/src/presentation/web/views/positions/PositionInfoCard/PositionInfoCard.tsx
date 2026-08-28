import { pairLabel } from "../labels";
import { PositionActions } from "../PositionActions/PositionActions";
import { PositionPair } from "../PositionPair/PositionPair";
import { PositionRangeBlock } from "../PositionRangeBlock/PositionRangeBlock";
import { PositionTokenAmounts } from "../PositionTokenAmounts/PositionTokenAmounts";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// No header row names the fields here, so the card is a description list: every <dt> is
// the name the table layout would have taken from its <th scope="col">, and a <dl> keeps
// it programmatically tied to its value where an adjacent sr-only <span> would not.
// The two amount fields show their names: stacked bare numbers are indistinguishable from
// each other without the column header the table gives them.
export const PositionInfoCard = ({ card }: { card: ICardVM }) => (
  <li class="group position-item position-card flex flex-col gap-3 rounded-md border border-outline p-4">
    <PositionPair pair={card.pair} feeTierLabel={card.feeTierLabel} chainId={card.chainId} />

    <dl class="flex flex-col gap-3">
      <div>
        <dt class="sr-only">Range</dt>
        <dd>
          <PositionRangeBlock range={card.priceRange} tone={card.rangeTone} />
        </dd>
      </div>

      <div class="flex items-start justify-between gap-4">
        <dt class="text-on-surface-variant text-xs">Balance</dt>
        <dd>
          <PositionTokenAmounts tokens={card.principal} class="text-right" />
        </dd>
      </div>

      <div class="flex items-start justify-between gap-4">
        <dt class="text-on-surface-variant text-xs">Fees</dt>
        <dd>
          <PositionTokenAmounts tokens={card.fees} class="text-right" />
        </dd>
      </div>
    </dl>

    <div class="flex">
      <PositionActions card={card} pairLabel={pairLabel(card.pair)} />
    </div>
  </li>
);
