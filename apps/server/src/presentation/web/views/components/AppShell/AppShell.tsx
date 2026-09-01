import type { PropsWithChildren } from "hono/jsx";

import { cn } from "../../utils/cn";

// The panel every screen lives in. It replaced a frame that imitated a macOS window down to
// three traffic lights: once real navigation sits along its top edge, a second title bar
// pretending to be an OS chrome is one affordance too many, and none of the three could be
// operated anyway. The dot ground is what still reads it as a surface set on a plane.
export const AppShell = ({ class: className, children }: PropsWithChildren<{ class?: string }>) => (
  <div class={cn("surface-grid overflow-hidden rounded-xl border border-outline-variant bg-surface", className)}>{children}</div>
);
