import { Button } from "../../components/Button/Button";
import { Icon } from "../../components/Icon/Icon";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// `data-invert` is what htmx-params.ts reads to flip the stored preference and add it to the
// request.
const SURFACE = {
  item: {
    // The ref's colons break a #id lookup; `.position-item` is carried by both layouts.
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
      class="relative z-1 shrink-0 rounded-full border-transparent p-1 text-on-surface-variant invert-bubble hover:border-outline hover:text-on-surface focus-visible:border-outline focus-visible:text-on-surface group-hover:text-on-surface"
    >
      <Icon name="invert" size={16} />
    </Button>
  );
};
