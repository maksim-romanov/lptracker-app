import { createStore } from "mipd";

import { explorerAddressUrl, NETWORKS, networkLabel } from "../../views/networks";
import { shortAddress, type TWalletSource, WalletEntry } from "../lib/wallet.entity";
import { walletStore } from "../lib/wallet.store";
import ApplicationController from "./application_controller";
import type DialogController from "./dialog_controller";

type TEip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

// EIP-6963 discovery, requested at module load so wallets have announced by connect time.
const providerStore = createStore();

const ALL_CHAIN_IDS = NETWORKS.map((n) => n.id);

// An EOA has the same address on every EVM chain, so the explorer link is a choice: Ethereum
// wins if tracked, otherwise the first chain requested.
const MAINNET = 1;
const explorerChainOf = (chainIds: number[]): number => (chainIds.includes(MAINNET) ? MAINNET : (chainIds[0] ?? MAINNET));

// EIP-1193 reserves 4001 for "user rejected the request" — an expected outcome,
// not a fault worth reporting through handleError.
const isUserRejection = (error: unknown): boolean => typeof error === "object" && error !== null && (error as { code?: unknown }).code === 4001;

const hueOf = (address: string): number => {
  let hash = 0;
  for (let index = 2; index < address.length; index += 1) hash = (hash * 31 + address.charCodeAt(index)) % 360;
  return hash;
};

const addressOf = (event: Event): string =>
  (event.currentTarget as HTMLElement).closest<HTMLElement>("[data-wallet-address]")?.dataset.walletAddress ?? "";

export default class WalletController extends ApplicationController {
  static targets = [
    "connectButton",
    "walletPill",
    "walletAddress",
    "addressInput",
    "chips",
    "chipsEnd",
    "rowTemplate",
    "connectedGroup",
    "connectedList",
    "watchedGroup",
    "watchedList",
    "empty",
  ];
  static outlets = ["dialog"];

  declare readonly connectButtonTarget: HTMLButtonElement;
  declare readonly hasConnectButtonTarget: boolean;
  declare readonly walletPillTarget: HTMLButtonElement;
  declare readonly walletAddressTarget: HTMLElement;
  declare readonly addressInputTarget: HTMLInputElement;
  declare readonly chipsTarget: HTMLElement;
  declare readonly hasChipsTarget: boolean;
  declare readonly chipsEndTarget: HTMLElement;
  declare readonly rowTemplateTarget: HTMLTemplateElement;
  declare readonly hasRowTemplateTarget: boolean;
  declare readonly connectedGroupTarget: HTMLElement;
  declare readonly connectedListTarget: HTMLElement;
  declare readonly watchedGroupTarget: HTMLElement;
  declare readonly watchedListTarget: HTMLElement;
  declare readonly emptyTarget: HTMLElement;
  declare readonly dialogOutlet: DialogController;
  declare readonly hasDialogOutlet: boolean;

  connect(): void {
    this.render();
  }

  openSidebar(): void {
    if (this.hasDialogOutlet) this.dialogOutlet.open();
  }

  async connectWallet(): Promise<void> {
    const provider = this.injectedProvider();
    if (!provider) {
      this.notify("No wallet extension detected — paste an address below to watch it instead.");
      return;
    }

    let accounts: unknown;
    try {
      accounts = await provider.request({ method: "eth_requestAccounts" });
    } catch (error) {
      if (isUserRejection(error)) this.notify("Wallet connection cancelled.");
      else this.handleError(error, "Could not reach the wallet extension.");
      return;
    }

    const address = Array.isArray(accounts) ? accounts[0] : undefined;
    if (typeof address !== "string" || !this.track(address, "connected")) {
      this.notify("The wallet returned no usable account.");
    }
  }

  addManual(event: SubmitEvent): void {
    event.preventDefault();

    if (this.track(this.addressInputTarget.value.trim(), "watched")) {
      this.addressInputTarget.form?.reset();
      return;
    }
    // Leaves the field intact so a typo can be corrected.
    this.notify("That doesn't look like a wallet address — expected 0x followed by 40 hex characters.");
  }

  // Only the signer is cleared — watched addresses were never signed into.
  disconnectWallet(): void {
    walletStore.disconnect();
    this.refresh();
  }

  removeWallet(event: Event): void {
    walletStore.remove(addressOf(event));
    this.refresh();
  }

  rename(event: Event): void {
    walletStore.rename(addressOf(event), (event.currentTarget as HTMLInputElement).value);
    this.render();
  }

  async copyAddress(event: Event): Promise<void> {
    const address = addressOf(event);
    try {
      await navigator.clipboard.writeText(address);
      this.notify(`Copied ${shortAddress(address)}`);
    } catch (error) {
      this.handleError(error, "Could not copy the address.");
    }
  }

  private track(address: string, source: TWalletSource): boolean {
    const entry = WalletEntry.create(address, ALL_CHAIN_IDS, source);
    if (!entry) return false;

    if (source === "connected") walletStore.connect(entry);
    else walletStore.watch(entry);

    this.refresh();
    if (this.hasDialogOutlet && source === "connected") this.dialogOutlet.close();
    return true;
  }

  private refresh(): void {
    this.render();
    this.dispatch("refresh", { prefix: "board" });
  }

  private render(): void {
    this.renderNav();
    this.renderChips();
    this.renderGroups();
  }

  private renderNav(): void {
    if (!this.hasConnectButtonTarget) return;

    const [signer] = walletStore.bySource("connected");
    this.connectButtonTarget.hidden = signer !== undefined;
    this.walletPillTarget.hidden = signer === undefined;
    if (signer) this.walletAddressTarget.textContent = signer.displayName;
  }

  // Rebuilt wholesale rather than patched — chips are few, and this is the only place the
  // tracked set is visible without opening the panel.
  private renderChips(): void {
    if (!this.hasChipsTarget) return;

    for (const stale of this.chipsTarget.querySelectorAll("[data-wallet-chip]")) stale.remove();

    for (const entry of walletStore.list()) {
      const chip = document.createElement("li");
      chip.dataset.walletChip = entry.address;
      chip.className = "flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container px-3 py-1";

      const dot = document.createElement("span");
      dot.ariaHidden = "true";
      dot.className = "wallet-dot size-2 shrink-0 rounded-full";
      // CSP blocks a `style` attribute in markup, not a CSSOM write — the same route
      // range_controller takes for the price marker.
      dot.style.setProperty("--chip-hue", String(hueOf(entry.address)));

      // The tooltip carries the full address since the chip label may be a nickname or a
      // shortened form.
      const label = document.createElement("a");
      label.href = explorerAddressUrl(explorerChainOf(entry.chainIds), entry.address);
      label.target = "_blank";
      label.rel = "noopener noreferrer";
      label.dataset.tooltip = entry.address;
      label.setAttribute("aria-label", `${entry.displayName} on ${networkLabel(explorerChainOf(entry.chainIds))}`);
      // Monospace only for a raw address — a nickname is prose the user typed.
      label.className = `${entry.label ? "text-body-small" : "font-mono text-figure-small"} hover:text-primary-text`;
      label.textContent = entry.displayName;

      chip.append(dot, label);
      this.chipsTarget.insertBefore(chip, this.chipsEndTarget);
    }
  }

  private renderGroups(): void {
    if (!this.hasRowTemplateTarget) return;

    const connected = walletStore.bySource("connected");
    const watched = walletStore.bySource("watched");

    this.fill(this.connectedGroupTarget, this.connectedListTarget, connected);
    this.fill(this.watchedGroupTarget, this.watchedListTarget, watched);
    this.emptyTarget.hidden = connected.length + watched.length > 0;
  }

  private fill(group: HTMLElement, list: HTMLElement, entries: WalletEntry[]): void {
    group.hidden = entries.length === 0;
    list.replaceChildren();

    for (const entry of entries) {
      const row = this.rowTemplateTarget.content.cloneNode(true) as DocumentFragment;
      const item = row.querySelector<HTMLElement>("li");
      if (!item) continue;
      item.dataset.walletAddress = entry.address;

      const dot = row.querySelector<HTMLElement>('[data-wallet-row="dot"]');
      dot?.style.setProperty("--chip-hue", String(hueOf(entry.address)));

      const label = row.querySelector<HTMLInputElement>('[data-wallet-row="label"]');
      if (label) {
        label.value = entry.label ?? "";
        // Not the address — that's printed directly below, and repeating it would make an
        // empty field look filled.
        label.placeholder = "Add a nickname";
        label.setAttribute("aria-label", `Nickname for ${shortAddress(entry.address)}`);
      }

      const address = row.querySelector<HTMLAnchorElement>('[data-wallet-row="address"]');
      if (address) {
        const chainId = explorerChainOf(entry.chainIds);
        address.textContent = shortAddress(entry.address);
        address.href = explorerAddressUrl(chainId, entry.address);
        address.dataset.tooltip = entry.address;
        address.setAttribute("aria-label", `${shortAddress(entry.address)} on ${networkLabel(chainId)}`);
      }

      row.querySelector('[data-wallet-row="copy"]')?.setAttribute("aria-label", `Copy ${shortAddress(entry.address)}`);
      row
        .querySelector('[data-wallet-row="remove"]')
        ?.setAttribute("aria-label", entry.source === "connected" ? "Disconnect wallet" : `Stop watching ${shortAddress(entry.address)}`);

      list.append(row);
    }
  }

  private injectedProvider(): TEip1193Provider | undefined {
    const [announced] = providerStore.getProviders();
    if (announced) return announced.provider as TEip1193Provider;
    return (window as { ethereum?: TEip1193Provider }).ethereum;
  }
}
