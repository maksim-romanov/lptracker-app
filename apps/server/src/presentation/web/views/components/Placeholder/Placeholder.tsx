import type { Child, PropsWithChildren } from "hono/jsx";

import { cn } from "../../utils/cn";

type Props = PropsWithChildren<{ icon: Child; class?: string }>;

export const Placeholder = ({ icon, class: className, children }: Props) => (
  <div class={cn("flex flex-col items-center gap-3 rounded-md border border-outline p-8 text-center", className)}>
    {icon}
    {children}
  </div>
);
