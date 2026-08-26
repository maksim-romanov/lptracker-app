import type { JSX } from "hono/jsx";

type Props = JSX.IntrinsicElements["input"];

export const TextInput = ({ class: className, ...rest }: Props) => (
  <input class={`rounded-sm border border-outline px-3 py-2${className ? ` ${className}` : ""}`} {...rest} />
);
