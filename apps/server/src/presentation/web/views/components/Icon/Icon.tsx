import { cn } from "../../utils/cn";

export type TIconName =
  | "invert"
  | "close"
  | "check"
  | "plus"
  | "sun"
  | "moon"
  | "wallet"
  | "inbox"
  | "external"
  | "alert"
  | "rows"
  | "cards"
  | "copy"
  | "trash";
export type TIconSize = 12 | 15 | 16 | 18 | 20 | 28 | 32;

type Props = { name: TIconName; size?: TIconSize; class?: string };

// CSP is style-src 'self' (no unsafe-inline) — icon.css's static classes carry the mask-image
// and size, never an inline `style` attribute.
export const Icon = ({ name, size = 20, class: className }: Props) => (
  <span aria-hidden="true" class={cn("icon", `icon-${name}`, `icon-size-${size}`, className)} />
);
