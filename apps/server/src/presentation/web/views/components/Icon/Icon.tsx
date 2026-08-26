export type TIconName = "invert" | "close" | "check" | "plus" | "sun" | "moon" | "wallet" | "inbox" | "external" | "alert";

type Props = { name: TIconName; size?: number; class?: string };

export const Icon = ({ name, size = 20, class: className }: Props) => (
  <span
    aria-hidden="true"
    class={`icon${className ? ` ${className}` : ""}`}
    style={{ "--icon-url": `url(/static/icons/${name}.svg)`, width: size, height: size }}
  />
);
