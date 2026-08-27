import { createStore } from "mipd";

import { NETWORKS } from "../../views/networks";
import { shortAddress, WalletEntry } from "../lib/wallet.entity";
import { walletStore } from "../lib/wallet.store";
import ApplicationController from "./application_controller";
import type DialogController from "./dialog_controller";

type TEip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

// EIP-6963 discovery, requested at module load so wallets have announced by connect time.
const providerStore = createStore();

const ALL_CHAIN_IDS = NETWORKS.map((n) => n.id);

// EIP-1193 reserves 4001 for "user rejected the request" — an expected outcome,
// not a fault worth reporting through handleError.
const isUserRejection = (error: unknown): boolean => typeof error === "object" && error !== null && (error as { code?: unknown }).code === 4001;

export default class WalletController extends ApplicationController {
  static targets = ["connectButton", "walletPill", "walletAddress", "addressInput"];
  static outlets = ["dialog"];
  static values = { address: String };

  declare readonly connectButtonTarget: HTMLButtonElement;
  declare readonly hasConnectButtonTarget: boolean;
  declare readonly walletPillTarget: HTMLButtonElement;
  declare readonly walletAddressTarget: HTMLElement;
  declare readonly addressInputTarget: HTMLInputElement;
  declare readonly dialogOutlet: DialogController;
  declare readonly hasDialogOutlet: boolean;
  declare addressValue: string;

  connect(): void {
    this.addressValue = walletStore.list()[0]?.address ?? "";
  }

  addressValueChanged(): void {
    if (!this.hasConnectButtonTarget) return;

    const connected = this.addressValue !== "";
    this.connectButtonTarget.hidden = connected;
    this.walletPillTarget.hidden = !connected;
    if (connected) this.walletAddressTarget.textContent = shortAddress(this.addressValue);
  }

  openSidebar(): void {
    if (this.hasDialogOutlet) this.dialogOutlet.open();
  }

  async connectWallet(): Promise<void> {
    const provider = this.injectedProvider();
    if (!provider) {
      this.notify("No wallet extension detected — paste an address below to track it instead.");
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
    if (typeof address !== "string" || !this.track(address)) {
      this.notify("The wallet returned no usable account.");
    }
  }

  addManual(event: SubmitEvent): void {
    event.preventDefault();

    if (this.track(this.addressInputTarget.value.trim())) {
      this.addressInputTarget.form?.reset();
      return;
    }
    // Deliberately leaves the field intact so a typo can be corrected.
    this.notify("That doesn't look like a wallet address — expected 0x followed by 40 hex characters.");
  }

  disconnectWallet(): void {
    walletStore.clear();
    this.addressValue = "";
    this.dispatch("refresh", { prefix: "board" });
  }

  private track(address: string): boolean {
    const entry = WalletEntry.create(address, ALL_CHAIN_IDS);
    if (!entry) return false;

    walletStore.replace(entry);
    this.addressValue = entry.address;
    this.dispatch("refresh", { prefix: "board" });
    if (this.hasDialogOutlet) this.dialogOutlet.close();
    return true;
  }

  private injectedProvider(): TEip1193Provider | undefined {
    const [announced] = providerStore.getProviders();
    if (announced) return announced.provider as TEip1193Provider;
    return (window as { ethereum?: TEip1193Provider }).ethereum;
  }
}
