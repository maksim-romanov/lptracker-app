import { Tag } from "../../components/Tag/Tag";
import { cn } from "../../utils/cn";
import { pairLabel, statusLabel } from "../labels";
import { PositionActions } from "../PositionActions/PositionActions";
import { PositionPair } from "../PositionPair/PositionPair";
import { PositionPrincipal } from "../PositionPrincipal/PositionPrincipal";
import { PositionRangeBlock } from "../PositionRangeBlock/PositionRangeBlock";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// Horizontal inset lives on the cells, not on the table wrapper, so the row rules run
// the full width of the container. HEAD_CELL in Positions.tsx must keep the same px or
// the header labels stop lining up with the column contents.
// `group-last` reaches the enclosing row, so the bottom rule is dropped on the final
// one — a plain `tr:last-child > *` rule in @layer components loses to `border-b`.
const CELL = "border-outline border-b px-4 py-3 align-middle group-last:border-b-0";

export const PositionInfoRow = ({ card }: { card: ICardVM }) => (
  <tr class="group position-item position-row">
    <th scope="row" class={cn(CELL, "text-left font-normal")}>
      <PositionPair pair={card.pair} feeTierLabel={card.feeTierLabel} />
    </th>

    <td class={CELL}>
      <PositionRangeBlock range={card.priceRange} />
    </td>

    <td class={CELL}>
      <PositionPrincipal principal={card.principal} />
    </td>

    <td class={CELL}>
      <Tag>{statusLabel(card.status)}</Tag>
    </td>

    <td class={cn(CELL, "position-row-actions")}>
      <PositionActions card={card} pairLabel={pairLabel(card.pair)} />
    </td>
  </tr>
);
