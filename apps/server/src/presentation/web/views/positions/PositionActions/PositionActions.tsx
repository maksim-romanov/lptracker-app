import { Button } from "../../components/Button/Button";
import { Icon } from "../../components/Icon/Icon";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

export const PositionActions = ({ card, pairLabel }: { card: ICardVM; pairLabel: string }) => (
  <>
    {/* The row/card-sized click target is this button, stretched by a pseudo-element
        (position-list.css). A click handler on the container would instead announce
        every field inside it as clickable. */}
    <button
      type="button"
      class="position-overlay cursor-pointer"
      aria-haspopup="dialog"
      aria-label={`View ${pairLabel} details`}
      hx-get={`/positions/${card.ref}/detail?inverted=${card.inverted ? "1" : "0"}`}
      hx-target="#position-modal-box"
      hx-swap="innerHTML transition:false"
      hx-indicator="#position-toast-loading"
    />
    <Button
      data-invert={card.ref}
      hx-get={`/positions/${card.ref}/item`}
      // hx-target must be a valid selector, and the ref's colons break a #id lookup.
      // `.position-item` is carried by both layouts, so this works in either one.
      hx-target="closest .position-item"
      hx-swap="outerHTML"
      hx-indicator="this"
      aria-label="Invert price"
      // Muted and unframed at rest so a secondary action stops competing with the row's
      // data, and never hidden behind hover alone — that would strand it on touch. The
      // border stays declared, only transparent, so nothing shifts when it comes back.
      class="relative z-1 border-transparent p-1.5 text-on-surface-variant focus-visible:border-outline focus-visible:text-on-surface group-hover:border-outline group-hover:text-on-surface"
    >
      <Icon name="invert" size={16} />
    </Button>
  </>
);
