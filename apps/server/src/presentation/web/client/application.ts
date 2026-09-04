import "./htmx-params";

import { Application } from "@hotwired/stimulus";
import htmx from "htmx.org";

import DialogController from "./controllers/dialog_controller";
import LayoutController from "./controllers/layout_controller";
import RangeController from "./controllers/range_controller";
import ThemeController from "./controllers/theme_controller";
import ToastController from "./controllers/toast_controller";
import TokenIconController from "./controllers/token_icon_controller";
import TooltipController from "./controllers/tooltip_controller";
import WalletController from "./controllers/wallet_controller";
import { onLayoutChange } from "./lib/layout";
import { layoutPrefs } from "./lib/layout-prefs.store";
import { positionPrefs } from "./lib/position-prefs.store";
import { walletStore } from "./lib/wallet.store";

// Exported so the init sequence is unit-testable in isolation.
export async function start(): Promise<void> {
  // Set before htmx's DOMContentLoaded init runs, so no indicator <style> is
  // injected (keeps style-src 'self' clean).
  htmx.config.includeIndicatorStyles = false;
  // Off, measured rather than assumed: a view transition captures the old and new document and
  // cross-fades them, and this board is 269 rows and 23,000px tall. Every swap froze one frame
  // for ~300ms, after htmx:afterSettle — the stall was the capture, not the request. A cut is
  // what the board wants anyway; the rows are the same rows in a different order.
  htmx.config.globalViewTransitions = false;

  // webRoutes' error paths (invalid ref, unknown protocol, upstream failure) return a real
  // ErrorBanner fragment with a 4xx/5xx status — htmx's default responseHandling drops the
  // swap for those codes, so the fragment never reaches the DOM (and the position-detail
  // modal's htmx:afterSwap->dialog#open trigger never fires either). These are expected,
  // handled states (neverthrow Result → HTTP), not faults to hide from the user.
  htmx.config.responseHandling = [
    { code: "204", swap: false },
    { code: "[23]..", swap: true },
    { code: "[45]..", swap: true, error: false },
    { code: "...", swap: false },
  ];

  // Hydrate the sync store caches before htmx fires its first request —
  // htmx:configRequest reads them synchronously and cannot await. Stores default
  // to localStorage (hydrate settles on the next microtask, well before
  // DOMContentLoaded); a real async backend would instead need to gate the #board load.
  await Promise.all([walletStore.hydrate(), positionPrefs.hydrate(), layoutPrefs.hydrate()]);

  const app = Application.start();
  app.register("wallet", WalletController);
  app.register("theme", ThemeController);
  app.register("toast", ToastController);
  app.register("dialog", DialogController);
  app.register("range", RangeController);
  app.register("layout", LayoutController);
  app.register("token-icon", TokenIconController);
  app.register("tooltip", TooltipController);

  // The board renders as a table or as cards depending on viewport width — unless the user
  // has picked one, in which case crossing the breakpoint changes nothing. Either way the
  // choice is made server-side from a request parameter, so it has to refetch. #board already
  // listens for this event (Layout.tsx).
  // Bubbling on purpose: #board hears this at the target (hx-trigger="... from:body"), but the
  // layout toggle listens on the document, and a non-bubbling event left its pressed state
  // showing a presentation the board had already stopped rendering.
  onLayoutChange(() => document.body.dispatchEvent(new CustomEvent("board:refresh", { bubbles: true })));
}

// hydrate() is failure-proof by contract (collection.store.ts), so this should not
// fire — but a rejection here would silently leave the page with zero controllers,
// which is worth a console trace rather than an unhandled rejection.
void start().catch((error) => console.error("app init failed", error));
