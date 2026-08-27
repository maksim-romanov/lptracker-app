import { Tag } from "../../components/Tag/Tag";
import { pairLabel, statusLabel } from "../labels";
import { PositionActions } from "../PositionActions/PositionActions";
import { PositionPair } from "../PositionPair/PositionPair";
import { PositionPrincipal } from "../PositionPrincipal/PositionPrincipal";
import { PositionRangeBlock } from "../PositionRangeBlock/PositionRangeBlock";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// No header row names the fields here, so the card is a description list: every <dt>
// is the name the table layout would have taken from its <th scope="col">. The names
// are visually hidden — the values are self-evident on screen — but a <dl> keeps them
// programmatically tied to their value, which an adjacent sr-only <span> would not.
export const PositionInfoCard = ({ card }: { card: ICardVM }) => (
  <li class="position-item position-card flex flex-col gap-3 rounded-md border border-outline p-4">
    <PositionPair pair={card.pair} feeTierLabel={card.feeTierLabel} />

    <dl class="flex flex-col gap-3">
      <div>
        <dt class="sr-only">Range</dt>
        <dd>
          <PositionRangeBlock range={card.priceRange} />
        </dd>
      </div>

      <div>
        <dt class="sr-only">Principal</dt>
        <dd>
          <PositionPrincipal principal={card.principal} />
        </dd>
      </div>

      <div>
        <dt class="sr-only">Status</dt>
        <dd>
          <Tag>{statusLabel(card.status)}</Tag>
        </dd>
      </div>
    </dl>

    <div class="flex">
      <PositionActions card={card} pairLabel={pairLabel(card.pair)} />
    </div>
  </li>
);
