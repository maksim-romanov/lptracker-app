import type { PropsWithChildren } from "hono/jsx";

import { cn } from "../../utils/cn";

export const AppShell = ({ class: className, children }: PropsWithChildren<{ class?: string }>) => (
  <div class={cn("surface-grid overflow-hidden rounded-xl border border-outline-variant bg-surface", className)}>{children}</div>
);
