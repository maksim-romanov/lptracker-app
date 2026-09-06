import type { Child, PropsWithChildren } from "hono/jsx";

import { cn } from "../../utils/cn";

type Props = PropsWithChildren<{ icon: Child; title: string; class?: string }>;

export const Placeholder = ({ icon, title, class: className, children }: Props) => (
  <div class={cn("flex flex-col items-center gap-4 px-6 py-48 text-center", className)}>
    <span class="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary-text placeholder-icon">
      {icon}
    </span>
    <h3 class="text-headline text-on-surface">{title}</h3>
    <div class="flex flex-col items-center gap-3">{children}</div>
  </div>
);
