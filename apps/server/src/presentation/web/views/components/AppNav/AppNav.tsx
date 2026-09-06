import type { Child } from "hono/jsx";

import { Logo } from "../Logo/Logo";

export const AppNav = ({ actions }: { actions?: Child }) => (
  <div class="flex items-center gap-4 border-outline-variant border-b px-5 py-3">
    <Logo />

    <div class="ms-auto flex items-center gap-2">{actions}</div>
  </div>
);
