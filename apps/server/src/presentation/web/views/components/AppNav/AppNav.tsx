import type { Child } from "hono/jsx";

import { Logo } from "../Logo/Logo";

// No section nav. There is one screen, so "Positions" pointed at the page it was already on,
// and "Wallets" duplicated two controls that are both on this row already — the connect button
// beside it and the "+ Add wallet" chip under the hero. A nav bar with nowhere to go is chrome
// that only says the product is bigger than it is.

export const AppNav = ({ actions }: { actions?: Child }) => (
  <div class="flex items-center gap-4 border-outline-variant border-b px-5 py-3">
    <Logo />

    <div class="ms-auto flex items-center gap-2">{actions}</div>
  </div>
);
