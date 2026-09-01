import type { PropsWithChildren } from "hono/jsx";

// The page's own <h1>. The wordmark in the nav is the product's name, not this screen's
// subject, so it stays a plain label and the document outline starts here.
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
