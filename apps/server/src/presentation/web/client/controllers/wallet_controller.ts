import { Controller } from "@hotwired/stimulus";

import { WalletEntry } from "../lib/wallet.entity";
import { walletStore } from "../lib/wallet.store";

export default class WalletController extends Controller {
  static targets = ["address", "chain", "chips", "chipTemplate"];

  declare readonly addressTarget: HTMLInputElement;
  declare readonly chainTargets: HTMLInputElement[];
  declare readonly chipsTarget: HTMLElement;
  declare readonly chipTemplateTarget: HTMLTemplateElement;

  // Wallets are client-owned (localStorage) — render their chips locally, no
  // round-trip. Positions stay server-rendered (their data is server-side).
  connect(): void {
    this.renderChips();
  }

  add(event: SubmitEvent): void {
    event.preventDefault();

    const chainIds = this.chainTargets.filter((c) => c.checked).map((c) => Number(c.value));
    const entry = WalletEntry.create(this.addressTarget.value.trim(), chainIds);
    if (!entry) return;

    walletStore.add(entry);
    (event.target as HTMLFormElement).reset();
    this.renderChips();
    this.dispatch("refresh", { prefix: "board" });
  }

  remove(event: Event & { params: { address: string } }): void {
    walletStore.remove(event.params.address);
    this.renderChips();
    this.dispatch("refresh", { prefix: "board" });
  }

  // Clone the server-rendered <template> per wallet (CSP-safe: markup stays in
  // HTML, no innerHTML string-building).
  private renderChips(): void {
    this.chipsTarget.replaceChildren();
    for (const entry of walletStore.list()) {
      const fragment = this.chipTemplateTarget.content.cloneNode(true) as DocumentFragment;
      const label = fragment.querySelector("[data-chip-label]");
      if (label) label.textContent = entry.shortLabel();
      const removeButton = fragment.querySelector("button");
      if (removeButton) removeButton.setAttribute("data-wallet-address-param", entry.address);
      this.chipsTarget.appendChild(fragment);
    }
  }
}
