import type { PropsWithChildren } from "hono/jsx";

import { cn, type TIntrinsic } from "../../utils/cn";

type Props = PropsWithChildren<TIntrinsic<"button">>;

export const Button = ({ type = "button", class: className, children, ...rest }: Props) => (
  <button type={type} class={cn("cursor-pointer rounded-sm border border-outline", className)} {...rest}>
    {children}
  </button>
);
