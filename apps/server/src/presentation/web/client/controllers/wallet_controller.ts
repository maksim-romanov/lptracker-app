import { Controller } from "@hotwired/stimulus";
import { createStore } from "mipd";

import { NETWORKS } from "../../views/networks";
import { WalletEntry } from "../lib/wallet.entity";
import { walletStore } from "../lib/wallet.store";

type TEip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

// EIP-6963 discovery, requested at module load so wallets have announced by connect time.
const providerStore = createStore();

const ALL_CHAIN_IDS = NETWORKS.map((n) => n.id);

export default class WalletController extends Controller {
  static targets = ["sidebar", "connectButton", "walletPill", "walletAddress", "addressInput"];

  declare readonly sidebarTarget: HTMLDialogElement;
  declare readonly hasSidebarTarget: boolean;
  declare readonly connectButtonTarget: HTMLButtonElement;
  declare readonly walletPillTarget: HTMLButtonElement;
  declare readonly walletAddressTarget: HTMLElement;
  declare readonly addressInputTarget: HTMLInputElement;

  connect(): void {
    this.render();
  }

  openSidebar(): void {
    this.sidebarTarget.showModal();
  }

  async connectWallet(): Promise<void> {
    const provider = this.injectedProvider();
    if (!provider) return;

    let accounts: unknown;
    try {
      accounts = await provider.request({ method: "eth_requestAccounts" });
    } catch {
      return;
    }

    const address = Array.isArray(accounts) ? accounts[0] : undefined;
    if (typeof address !== "string") return;

    this.track(address);
  }

  addManual(event: SubmitEvent): void {
    event.preventDefault();
    this.track(this.addressInputTarget.value.trim());
    (event.target as HTMLFormElement).reset();
  }

  disconnectWallet(): void {
    walletStore.clear();
    this.render();
    this.dispatch("refresh", { prefix: "board" });
  }

  private track(address: string): void {
    const entry = WalletEntry.create(address, ALL_CHAIN_IDS);
    if (!entry) return;

    walletStore.replace(entry);
    this.render();
    this.dispatch("refresh", { prefix: "board" });
    if (this.hasSidebarTarget && this.sidebarTarget.open) this.sidebarTarget.close();
  }

  private render(): void {
    const entry = walletStore.list()[0];
    this.connectButtonTarget.hidden = Boolean(entry);
    this.walletPillTarget.hidden = !entry;
    if (entry) this.walletAddressTarget.textContent = entry.shortLabel();
  }

  private injectedProvider(): TEip1193Provider | undefined {
    const [announced] = providerStore.getProviders();
    if (announced) return announced.provider as TEip1193Provider;
    return (window as { ethereum?: TEip1193Provider }).ethereum;
  }
}
