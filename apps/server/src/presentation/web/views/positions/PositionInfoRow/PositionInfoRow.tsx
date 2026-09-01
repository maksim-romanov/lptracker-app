import { cn } from "../../utils/cn";
import { PositionOverlay } from "../PositionOverlay/PositionOverlay";
import { PositionPair } from "../PositionPair/PositionPair";
import { PositionRange } from "../PositionRange/PositionRange";
import { PositionTokenAmounts } from "../PositionTokenAmounts/PositionTokenAmounts";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// No rules between rows: hover is what separates them, and a line under every row turns a list
// of four into a grid of twenty. HEAD_CELL in Positions.tsx must keep the same horizontal
// padding or the header labels stop lining up with the column contents.
const CELL = "px-3 py-4 align-middle";

export const PositionInfoRow = ({ card }: { card: ICardVM }) => (
  <tr class="group position-item position-row">
    {/* The row's activation overlay is anchored here rather than in a column of its own — see
        position-list.css for why it cannot hang off the <tr>. */}
    <th scope="row" class={cn(CELL, "position-row-anchor text-left font-normal")}>
      <PositionOverlay card={card} />
      <PositionPair card={card} />
    </th>

    <td class={CELL}>
      <PositionRange range={card.priceRange} tone={card.rangeTone} />
    </td>

    <td class={CELL}>
      <PositionTokenAmounts tokens={card.principal} />
    </td>

    <td class={CELL}>
      <PositionTokenAmounts tokens={card.fees} earning={card.hasUnclaimedFees} />
    </td>
  </tr>
);
