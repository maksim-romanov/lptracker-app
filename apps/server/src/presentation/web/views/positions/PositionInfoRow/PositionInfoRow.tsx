import { FEE_ACCRUAL_MODES } from "@depthly/catalog";

import { cn } from "../../utils/cn";
import type { ICardVM } from "../card.vm";
import { itemDomId } from "../labels";
import { PositionOverlay } from "../PositionOverlay/PositionOverlay";
import { PositionPair } from "../PositionPair/PositionPair";
import { PositionRange } from "../PositionRange/PositionRange";
import { PositionTokenAmounts } from "../PositionTokenAmounts/PositionTokenAmounts";

// HEAD_CELL in Positions.tsx must keep the same horizontal padding, including the wider outer
// edges, or the header labels stop lining up with the column contents.
const CELL = "px-3 py-4 align-middle first:ps-5 last:pe-5";

export const PositionInfoRow = ({ card, oob = false }: { card: ICardVM; oob?: boolean }) => (
  <tr id={itemDomId(card.ref)} class="group position-item position-row" hx-swap-oob={oob ? "true" : undefined}>
    {/* The row's activation overlay is anchored here rather than in a column of its own — see
        position-list.css for why it cannot hang off the <tr>. */}
    <th scope="row" class={cn(CELL, "position-row-anchor text-left font-normal")}>
      <PositionOverlay card={card} />
      <PositionPair card={card} />
    </th>

    <td class={CELL}>
      {card.priceRange ? (
        <PositionRange range={card.priceRange} tone={card.rangeTone} />
      ) : (
        // A protocol with no price range leaves the column empty rather than drawing an
        // empty bar, which would read as a range whose bounds failed to load.
        <span class="block text-body-small text-on-surface-variant">
          <span aria-hidden="true">&mdash;</span>
          <span class="sr-only">No price range</span>
        </span>
      )}
    </td>

    <td class={CELL}>
      <PositionTokenAmounts tokens={card.principal} />
    </td>

    <td class={CELL}>
      <PositionTokenAmounts tokens={card.owed} earning={card.hasUnclaimedBalance} read={card.feeMode !== FEE_ACCRUAL_MODES.unknown} />
    </td>
  </tr>
);
