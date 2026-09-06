import { cn } from "../../utils/cn";

export const Logo = ({ class: className }: { class?: string }) => (
  <span class={cn("whitespace-nowrap text-headline", className)}>
    Depthly
    <span aria-hidden="true" class="logo-dot" />
  </span>
);
