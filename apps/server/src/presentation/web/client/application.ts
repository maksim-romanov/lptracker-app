import "./htmx-params";

import { Application } from "@hotwired/stimulus";
import htmx from "htmx.org";

import ModalController from "./controllers/modal_controller";
import RangeController from "./controllers/range_controller";
import ThemeController from "./controllers/theme_controller";
import WalletController from "./controllers/wallet_controller";
import { positionPrefs } from "./lib/position-prefs.store";
import { walletStore } from "./lib/wallet.store";

// Exported so the init sequence is unit-testable in isolation.
export async function start(): Promise<void> {
  // Set before htmx's DOMContentLoaded init runs, so no indicator <style> is
  // injected (keeps style-src 'self' clean).
  htmx.config.includeIndicatorStyles = false;
  htmx.config.globalViewTransitions = true;

  // Hydrate the sync store caches before htmx fires its first request —
  // htmx:configRequest reads them synchronously and cannot await. Stores default
  // to localStorage (hydrate settles on the next microtask, well before
  // DOMContentLoaded); a real async backend would instead need to gate the #board load.
  await Promise.all([walletStore.hydrate(), positionPrefs.hydrate()]);

  const app = Application.start();
  app.register("wallet", WalletController);
  app.register("theme", ThemeController);
  app.register("modal", ModalController);
  app.register("range", RangeController);
}

void start();
