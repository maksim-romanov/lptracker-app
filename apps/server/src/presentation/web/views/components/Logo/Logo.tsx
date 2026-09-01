import { cn } from "../../utils/cn";

// The mark carries no meaning to read, so it is hidden rather than described: the wordmark
// beside it already says the name, and "gradient circle" is not information.
export const Logo = ({ class: className }: { class?: string }) => (
  <span class={cn("flex items-center gap-2", className)}>
    <span aria-hidden="true" class="logo-mark size-6 shrink-0 rounded-full" />
    <span class="text-headline">Depthly</span>
  </span>
);
