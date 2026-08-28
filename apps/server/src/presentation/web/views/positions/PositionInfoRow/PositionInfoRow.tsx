import { cn } from "../../utils/cn";
import { pairLabel } from "../labels";
import { PositionActions } from "../PositionActions/PositionActions";
import { PositionPair } from "../PositionPair/PositionPair";
import { PositionRange } from "../PositionRange/PositionRange";
import { PositionStatus } from "../PositionStatus/PositionStatus";
import { PositionTokenAmounts } from "../PositionTokenAmounts/PositionTokenAmounts";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// Horizontal inset lives on the cells, not on the table wrapper, so the row rules run
// the full width of the container. HEAD_CELL in Positions.tsx must keep the same px or
// the header labels stop lining up with the column contents.
// `group-last` reaches the enclosing row, so the bottom rule is dropped on the final
// one — a plain `tr:last-child > *` rule in @layer components loses to `border-b`.
const CELL = "border-outline-variant border-b px-4 py-2 align-middle group-last:border-b-0";

export const PositionInfoRow = ({ card }: { card: ICardVM }) => (
  <tr class="group position-item position-row">
    <th scope="row" class={cn(CELL, "text-left font-normal")}>
      <PositionPair pair={card.pair} feeTierLabel={card.feeTierLabel} chainId={card.chainId} />
    </th>

    <td class={CELL}>
      {/* The bar carries no text of its own, so the status beneath it is both the cell's
          reading for assistive tech and the only cue that survives without colour.
          Exact bounds live in the detail the row opens. */}
      <span class="flex flex-col gap-1.5">
        <PositionRange range={card.priceRange} tone={card.rangeTone} />
        <PositionStatus tone={card.rangeTone} />
      </span>
    </td>

    <td class={CELL}>
      <PositionTokenAmounts tokens={card.principal} class="text-right" />
    </td>

    <td class={CELL}>
      <PositionTokenAmounts tokens={card.fees} class="text-right" />
    </td>

    <td class={cn(CELL, "position-row-actions")}>
      {/* Flex, not the cell's own line box: an inline-level button sits on the baseline
          and drags the line's descender space along, which made the row taller than its
          tallest cell. The cell stays the overlay's positioned ancestor either way. */}
      <span class="flex justify-end">
        <PositionActions card={card} pairLabel={pairLabel(card.pair)} />
      </span>
    </td>
  </tr>
);
