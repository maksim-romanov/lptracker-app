import { Controller } from "@hotwired/stimulus";

import { hueOf } from "../lib/wallet.entity";
import type DialogController from "./dialog_controller";

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

// Lets a wallet be watched from anywhere on the page, not only from the sidebar's own input —
// so tracking one address doesn't require opening the panel first. A paste that lands in a field
// is that field's own business (its normal paste behavior applies there), so this only reacts to
// one that lands nowhere in particular. Confirms first rather than adding outright: nothing on
// screen suggests a paste anywhere on the page does something, so the popup is what tells the
// user it happened, not just the toast afterward.
export default class PasteWatchController extends Controller {
  static targets = ["address", "dot"];
  static outlets = ["dialog"];

  declare readonly addressTarget: HTMLElement;
  declare readonly dotTarget: HTMLElement;
  declare readonly dialogOutlet: DialogController;
  declare readonly hasDialogOutlet: boolean;

  private pending: string | null = null;

  paste(event: ClipboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest("input, textarea, [contenteditable]")) return;

    const text = event.clipboardData?.getData("text")?.trim();
    if (!text || !ADDRESS_RE.test(text)) return;

    this.pending = text.toLowerCase();
    this.addressTarget.textContent = this.pending;
    // CSP allows no `style` attribute in markup — same CSSOM route wallet_controller's chips
    // take for the dot's hue.
    this.dotTarget.style.setProperty("--chip-hue", String(hueOf(this.pending)));
    if (this.hasDialogOutlet) this.dialogOutlet.open();
  }

  confirm(): void {
    if (!this.pending) return;
    this.dispatch("paste", { prefix: "wallet", detail: { address: this.pending } });
    this.pending = null;
  }
}
