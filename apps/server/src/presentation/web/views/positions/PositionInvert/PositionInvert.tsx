import { Button } from "../../components/Button/Button";
import { Icon } from "../../components/Icon/Icon";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// Sits with the pair it inverts, not in a column of its own: which way round the price is read
// is a property of the name beside it, and a column for one icon cost the table a fifth of its
// width on every row.
// `z-1` lifts it clear of the item-sized overlay pseudo-element, so its own click is the one
// that lands.
export const PositionInvert = ({ card }: { card: ICardVM }) => (
  <Button
    data-invert={card.ref}
    hx-get={`/positions/${card.ref}/item`}
    // hx-target must be a valid selector, and the ref's colons break a #id lookup.
    // `.position-item` is carried by both layouts, so this works in either one.
    hx-target="closest .position-item"
    hx-swap="outerHTML"
    hx-indicator="this"
    aria-label="Invert price"
    // Muted and unframed at rest so a secondary action stops competing with the row's data, and
    // never hidden behind hover alone — that would strand it on touch. The border stays
    // declared, only transparent, so nothing shifts when it comes back.
    // `leading-none` because the button sits inside the pair's heading and would otherwise
    // inherit its line-height, wrapping a 16px icon in a 34px box and stretching the row.
    class="relative z-1 shrink-0 border-transparent p-1 text-on-surface-variant leading-none focus-visible:border-outline focus-visible:text-on-surface group-hover:border-outline group-hover:text-on-surface"
  >
    <Icon name="invert" size={16} />
  </Button>
);
