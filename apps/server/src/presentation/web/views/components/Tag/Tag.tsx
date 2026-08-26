import type { PropsWithChildren } from "hono/jsx";

type Props = PropsWithChildren<{ class?: string }>;

export const Tag = ({ class: className, children }: Props) => (
  <span class={`inline-flex items-center gap-1 rounded-sm border border-outline px-2 py-0.5 text-xs${className ? ` ${className}` : ""}`}>
    {children}
  </span>
);
