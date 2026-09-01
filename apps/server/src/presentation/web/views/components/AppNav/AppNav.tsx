import type { Child } from "hono/jsx";

import { Logo } from "../Logo/Logo";

// Only the destinations that exist. The design this came from also lists "Activity", and a
// link to a feature that has not been built is a promise the app cannot keep — it goes in
// when there is something behind it. Wallets is a <button> rather than a link because it
// opens a panel over this page; calling it a link would announce a navigation that never
// happens.
const LINK = "rounded-xs px-1 py-0.5 text-body-small text-on-surface-variant hover:text-on-surface";

export const AppNav = ({ actions }: { actions?: Child }) => (
  <div class="flex items-center gap-4 border-outline-variant border-b px-5 py-3">
    <Logo />

    <nav aria-label="Sections">
      <ul class="flex items-center gap-1">
        <li>
          <a href="/" aria-current="page" class={`${LINK} aria-[current]:text-on-surface`}>
            Positions
          </a>
        </li>
        <li>
          <button type="button" aria-haspopup="dialog" data-action="wallet#openSidebar" class={`${LINK} cursor-pointer`}>
            Wallets
          </button>
        </li>
      </ul>
    </nav>

    <div class="ms-auto flex items-center gap-2">{actions}</div>
  </div>
);
