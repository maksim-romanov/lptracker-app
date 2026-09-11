import type { ICardVM } from "../card.vm";
import { pairLabel } from "../labels";

// The row/card-sized click target, stretched over the item by a pseudo-element
// (position-list.css). It must be a child of whatever element that CSS makes the positioned
// ancestor.
export const PositionOverlay = ({ card }: { card: ICardVM }) => (
  <button
    type="button"
    class="position-overlay cursor-pointer"
    aria-haspopup="dialog"
    aria-label={`View ${pairLabel(card.pair)} details`}
    hx-get={`/positions/${card.ref}/detail?inverted=${card.inverted ? "1" : "0"}`}
    hx-target="#position-modal-box"
    hx-swap="innerHTML transition:false"
    hx-indicator="#position-toast-loading"
    hx-sync="this:replace"
  />
);
