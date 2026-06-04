import { CHAINS } from "core/config/chains";
import { action, computed, makeObservable, observable } from "mobx";
import { singleton } from "tsyringe";
import * as v from "valibot";
import { EWalletType, type Wallet } from "wallets/domain/entities/wallet.entity";
import { type TWalletDraft, WalletDraftSchema } from "wallets/domain/schemas/wallet.schema";

const DEFAULT_CHAIN_IDS = Object.values(CHAINS).map((c) => c.id);

export type WalletDraftError = Partial<Record<keyof TWalletDraft, string>>;

@singleton()
export class WalletDraftStore {
  @observable id: string | undefined = undefined;
  @observable name = "";
  @observable address = "";
  @observable type: EWalletType = EWalletType.ERC20;
  @observable.shallow chainIds: number[] = [...DEFAULT_CHAIN_IDS];
  @observable showErrors = false;

  constructor() {
    makeObservable(this);
  }

  @computed
  get isEdit(): boolean {
    return this.id !== undefined;
  }

  @computed
  get values(): TWalletDraft {
    return { name: this.name, address: this.address, type: this.type, chainIds: this.chainIds };
  }

  @computed
  get isValid(): boolean {
    return v.safeParse(WalletDraftSchema, this.values).success;
  }

  @computed
  get errors(): WalletDraftError {
    const result = v.safeParse(WalletDraftSchema, this.values);
    if (result.success) return {};

    const out: WalletDraftError = {};
    for (const issue of result.issues) {
      const key = issue.path?.[0]?.key as keyof TWalletDraft | undefined;
      if (key && !out[key]) out[key] = issue.message;
    }
    return out;
  }

  @action
  resetForCreate(): void {
    this.id = undefined;
    this.name = "";
    this.address = "";
    this.type = EWalletType.ERC20;
    this.chainIds = [...DEFAULT_CHAIN_IDS];
    this.showErrors = false;
  }

  @action
  initFromWallet(wallet: Wallet): void {
    this.id = wallet.id;
    this.name = wallet.name;
    this.address = wallet.address;
    this.type = wallet.type;
    this.chainIds = [...wallet.chainIds];
    this.showErrors = false;
  }

  @action
  setName(value: string): void {
    this.name = value;
  }

  @action
  setAddress(value: string): void {
    this.address = value;
  }

  @action
  setChainIds(ids: number[]): void {
    this.chainIds = ids;
  }

  @action
  toggleChain(id: number): void {
    this.chainIds = this.chainIds.includes(id) ? this.chainIds.filter((x) => x !== id) : [...this.chainIds, id];
  }

  @action
  markSubmitted(): void {
    this.showErrors = true;
  }
}
