import type { JSX, PropsWithChildren } from "hono/jsx";

type Props = PropsWithChildren<JSX.IntrinsicElements["button"]>;

export const Button = ({ type = "button", class: className, children, ...rest }: Props) => (
  <button type={type} class={`cursor-pointer rounded-sm border border-outline${className ? ` ${className}` : ""}`} {...rest}>
    {children}
  </button>
);
