import { cn } from "../../utils/cn";
import { rangeToneLabel } from "../labels";
import type { TPositionRangeTone } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// Soft fill, loud text — safe here only because the container roles are held to 4.5:1 against
// the fill they name (packages/theme's contrast test). The colour still never carries the
// state on its own: the word is always printed.
const TONE: Record<TPositionRangeTone, string> = {
  "in-range": "bg-success-container text-on-success-container",
  "near-lower": "bg-warning-container text-on-warning-container",
  "near-upper": "bg-warning-container text-on-warning-container",
  "out-of-range": "bg-error-container text-on-error-container",
  closed: "bg-surface-variant text-on-surface-variant",
};

export const PositionStatus = ({ tone, class: className }: { tone: TPositionRangeTone; class?: string }) => (
  <span class={cn("inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-0.5 text-caption", TONE[tone], className)}>
    {rangeToneLabel(tone)}
  </span>
);
