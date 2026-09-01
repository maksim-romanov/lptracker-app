import { pairLabel } from "../labels";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// The row/card-sized click target, stretched over the item by a pseudo-element
// (position-list.css). A click handler on the container would instead announce every field
// inside it as clickable, and role="grid" would impose a whole keyboard model this list does
// not need. It must be a child of whatever the CSS makes the positioned ancestor.
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
  />
);
