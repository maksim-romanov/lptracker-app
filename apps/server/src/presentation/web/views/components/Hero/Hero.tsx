import type { PropsWithChildren } from "hono/jsx";

type Props = PropsWithChildren<{ title: string; description: string }>;

export const Hero = ({ title, description, children }: Props) => (
  <div class="flex flex-col gap-3">
    <div class="flex flex-col gap-1">
      <h1 class="text-title">{title}</h1>
      <p class="text-body text-on-surface-variant">{description}</p>
    </div>
    {children}
  </div>
);
