import { cn } from "../../utils/cn";

type Props = { url: string; symbol: string; class?: string };

// Always a circle of a fixed size, whether the image arrives or not. A bare <img alt={symbol}>
// looked right until a token's icon 404'd, at which point the browser painted the alt text
// inside the image box and a three-letter symbol spilled across the icon beside it.
// The image itself is decorative: every place this is used prints the symbol as real text
// next to it — the pair name, the row header — so naming it again would only repeat it.
export const TokenIcon = ({ url, symbol, class: className }: Props) => (
  <span
    class={cn(
      "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-variant text-caption text-on-surface-variant",
      className,
    )}
  >
    {url ? <img src={url} alt="" loading="lazy" class="h-full w-full object-cover" /> : symbol.slice(0, 1)}
  </span>
);
