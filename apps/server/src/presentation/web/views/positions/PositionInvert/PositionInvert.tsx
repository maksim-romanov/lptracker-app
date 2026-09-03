import { Button } from "../../components/Button/Button";
import { Icon } from "../../components/Icon/Icon";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// The same control on two surfaces, differing only in what it asks for and where the answer
// goes — values, not two different buttons.
// `item` swaps the one row or card it sits in. `detail` swaps the open panel and asks the
// server to send the board's copy of the row back with it (`sync=1`), because otherwise
// flipping a pair in the panel would leave the list still reading it the old way round.
// Either way `data-invert` is what htmx-params.ts looks for: it flips the stored preference
// and puts the new value on the request.
const SURFACE = {
  item: {
    // hx-target must be a valid selector, and the ref's colons break a #id lookup.
    // `.position-item` is carried by both layouts, so this works in either one.
    target: "closest .position-item",
    swap: "outerHTML",
    indicator: "this",
    path: (ref: string) => `/positions/${ref}/item`,
  },
  detail: {
    target: "#position-modal-box",
    swap: "innerHTML",
    indicator: "#position-toast-loading",
    path: (ref: string) => `/positions/${ref}/detail?sync=1`,
  },
} as const;

type Props = { card: ICardVM; surface?: keyof typeof SURFACE };

// Sits with the pair it inverts, not in a column of its own: which way round the price is read
// is a property of the name beside it, and a column for one icon cost the table a fifth of its
// width on every row.
// `z-1` lifts it clear of the item-sized overlay pseudo-element, so its own click is the one
// that lands.
export const PositionInvert = ({ card, surface = "item" }: Props) => {
  const { target, swap, indicator, path } = SURFACE[surface];

  return (
    <Button
      data-invert={card.ref}
      hx-get={path(card.ref)}
      hx-target={target}
      hx-swap={swap}
      hx-indicator={indicator}
      aria-label="Invert price"
      // Muted and unframed at rest so a secondary action stops competing with the row's data. The
      // row's own hover only brightens the icon, which is what says the control is live without
      // drawing a frame around something the pointer is not on yet; the frame and the bubble
      // belong to this button and answer only to it. The border stays declared, only transparent,
      // so nothing shifts when it comes back.
      class="relative z-1 shrink-0 rounded-full border-transparent p-1 text-on-surface-variant invert-bubble hover:border-outline hover:text-on-surface focus-visible:border-outline focus-visible:text-on-surface group-hover:text-on-surface"
    >
      <Icon name="invert" size={16} />
    </Button>
  );
};
