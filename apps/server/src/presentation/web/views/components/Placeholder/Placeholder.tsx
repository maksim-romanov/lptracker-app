import type { Child, PropsWithChildren } from "hono/jsx";

type Props = PropsWithChildren<{ icon: Child; class?: string }>;

export const Placeholder = ({ icon, class: className, children }: Props) => (
  <div class={`flex flex-col items-center gap-3 rounded-md border border-outline p-8 text-center${className ? ` ${className}` : ""}`}>
    {icon}
    {children}
  </div>
);
