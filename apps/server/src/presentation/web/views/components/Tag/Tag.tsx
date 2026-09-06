import type { PropsWithChildren } from "hono/jsx";

import { cn } from "../../utils/cn";

type Props = PropsWithChildren<{ class?: string }>;

export const Tag = ({ class: className, children }: Props) => (
  <span class={cn("inline-flex items-center gap-1 rounded-sm border border-outline px-2 py-0.5 text-xs", className)}>{children}</span>
);
