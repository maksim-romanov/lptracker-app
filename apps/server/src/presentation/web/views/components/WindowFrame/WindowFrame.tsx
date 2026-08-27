import type { PropsWithChildren } from "hono/jsx";

import { cn } from "../../utils/cn";

// Decorative: there is no window to close, minimize or zoom, so these are spans hidden
// from assistive tech rather than three unlabelled buttons that do nothing.
const TRAFFIC_LIGHTS = ["close", "minimize", "zoom"] as const;

type Props = PropsWithChildren<{ title: string; class?: string }>;

export const WindowFrame = ({ title, class: className, children }: Props) => (
  <div class={cn("overflow-hidden rounded-xl border border-outline bg-surface-bright shadow-lg", className)}>
    <div class="flex items-center gap-3 border-outline border-b bg-surface-variant px-3 py-2.5">
      <span aria-hidden="true" class="flex gap-2">
        {TRAFFIC_LIGHTS.map((light) => (
          <span class={`traffic-light traffic-light-${light}`} />
        ))}
      </span>
      <h2 class="truncate font-medium text-on-surface-variant text-sm">{title}</h2>
    </div>
    <div class="window-grid window-content">{children}</div>
  </div>
);
