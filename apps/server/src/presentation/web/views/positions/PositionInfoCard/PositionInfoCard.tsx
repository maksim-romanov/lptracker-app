import { PositionAmounts } from "../PositionAmounts/PositionAmounts";
import { PositionOverlay } from "../PositionOverlay/PositionOverlay";
import { PositionPair } from "../PositionPair/PositionPair";
import { PositionRange } from "../PositionRange/PositionRange";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// The card is the narrow-viewport presentation of the same data, not a second design. Scan order
// follows how a financial card is actually read: identity and state first, then the range, then
// the numbers — and every card keeps the same blocks so heights do not wobble.
export const PositionInfoCard = ({ card }: { card: ICardVM }) => (
  <li class="group position-item position-card flex flex-col gap-4 rounded-lg border border-outline-variant p-4">
    <PositionOverlay card={card} />
    <PositionPair card={card} />
    <PositionRange range={card.priceRange} tone={card.rangeTone} />

    {/* A closed position has no tokens to list, and without a floor its card stood shorter than
        the ones beside it in the grid. 76px is the rule, the header row and two token rows. */}
    <div class="min-h-19 border-outline-variant border-t pt-3">
      <PositionAmounts card={card} />
    </div>
  </li>
);
