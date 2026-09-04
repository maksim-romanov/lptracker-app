import { currentLayout } from "./lib/layout";
import { positionPrefs } from "./lib/position-prefs.store";
import { walletStore } from "./lib/wallet.store";

// htmx:configRequest carries no `detail.path` — derive the target from the
// requesting element's hx-get/hx-post attribute instead.
export const inject = (event: Event): void => {
  const detail = (event as CustomEvent).detail;
  const elt: Element | null = detail?.elt ?? null;
  const reqPath = elt?.getAttribute ? (elt.getAttribute("hx-get") ?? elt.getAttribute("hx-post") ?? "") : "";
  if (reqPath.indexOf("/positions") !== 0) return;

  const invertRef = elt?.getAttribute ? elt.getAttribute("data-invert") : null;
  if (invertRef) {
    detail.parameters.inverted = positionPrefs.toggleInverted(invertRef) ? "1" : "0";
    // The swap replaces one item in place, so it has to come back as whichever
    // presentation the board is currently rendered in.
    detail.parameters.layout = currentLayout();
    return;
  }

  if (reqPath !== "/positions") return;
  detail.parameters.wallets = walletStore.serialize();
  detail.parameters.inverted = positionPrefs.serializeInverted();
  detail.parameters.layout = currentLayout();
};

// Registered at bundle-eval time so the listener exists before htmx's own
// DOMContentLoaded init fires the first configRequest (the #board load). A
// Stimulus controller connects too late to win that race.
if (typeof document !== "undefined") {
  document.addEventListener("htmx:configRequest", inject);
}
