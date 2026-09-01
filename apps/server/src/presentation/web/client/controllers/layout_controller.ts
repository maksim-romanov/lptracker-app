import { Controller } from "@hotwired/stimulus";

import type { TPositionsLayout } from "../../positions-layout";
import { currentLayout } from "../lib/layout";
import { layoutPrefs } from "../lib/layout-prefs.store";

// The board's presentation is decided server-side from a request parameter, so choosing one is
// a refetch rather than a class swap. The pressed state is set here on connect instead of by
// the server: the shell renders before the board and has no idea what the client will ask for.
export default class LayoutController extends Controller {
  static targets = ["option"];

  declare readonly optionTargets: HTMLButtonElement[];

  connect(): void {
    this.sync();
  }

  choose(event: Event): void {
    const layout = (event.currentTarget as HTMLElement).dataset.layout;
    if (layout !== "table" && layout !== "cards") return;

    layoutPrefs.set(layout as TPositionsLayout);
    this.sync();
    this.dispatch("refresh", { prefix: "board" });
  }

  sync(): void {
    const active = currentLayout();
    for (const option of this.optionTargets) option.setAttribute("aria-pressed", String(option.dataset.layout === active));
  }
}
