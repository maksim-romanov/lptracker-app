import { cn } from "../../utils/cn";

// A wordmark and its full stop, not a mark beside a word: two symbols in one logo compete, and
// the one that carries the name is the word. The dot is punctuation rather than an icon, so it
// sits in the text flow and is sized in em — it tracks the wordmark at every size on its own.
export const Logo = ({ class: className }: { class?: string }) => (
  <span class={cn("whitespace-nowrap text-headline", className)}>
    Depthly
    <span aria-hidden="true" class="logo-dot" />
  </span>
);
