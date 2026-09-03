import type { PropsWithChildren } from "hono/jsx";

import { cn, type TIntrinsic } from "../../utils/cn";

type Props = PropsWithChildren<TIntrinsic<"button">>;

// `inline-flex` rather than the default `inline-block`: a button's children then sit in a flex
// box with no line box at all. An icon-only button was otherwise as tall as the inherited
// line-height instead of as tall as its icon — 36×42 for the theme toggle, which `rounded-full`
// drew as an oval — and every icon button had to remember `leading-none` to escape it.
export const Button = ({ type = "button", class: className, children, ...rest }: Props) => (
  <button type={type} class={cn("inline-flex cursor-pointer items-center justify-center rounded-sm border border-outline", className)} {...rest}>
    {children}
  </button>
);
