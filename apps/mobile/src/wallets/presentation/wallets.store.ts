import { Store } from "core/domain/base/store";
import { action, computed, makeObservable, observable } from "mobx";
import { inject, injectable } from "tsyringe";
import type { WalletsRepository } from "wallets/data/wallets.repository";
import { WALLETS_REPOSITORY } from "wallets/di/tokens";
import { type EWalletType, Wallet } from "wallets/domain/entities/wallet.entity";

import { DeleteWalletUseCase } from "../application/usecases/delete-wallet.usecase";

@injectable()
export class WalletsStore extends Store {
  @observable wallets: Wallet[] = [];
  @observable activeWalletId: string | undefined = undefined;

  constructor(
    @inject(WALLETS_REPOSITORY) private readonly repo: WalletsRepository,
    @inject(DeleteWalletUseCase) private readonly deleteUseCase: DeleteWalletUseCase,
  ) {
    super();
    makeObservable(this);
  }

  @computed
  get nextIndex(): number {
    return this.wallets.length + 1;
  }

  @computed
  get activeWallet(): Wallet | undefined {
    return this.wallets.find((w) => w.id === this.activeWalletId);
  }

  @computed
  get isEmpty(): boolean {
    return this.wallets.length === 0;
  }

  isExists(address: string): boolean {
    return this.wallets.some((w) => w.address === address);
  }

  @action
  setActiveWallet(id: string): void {
    this.activeWalletId = id;
  }

  @action
  hydrate(): void {
    this.wallets = this.repo.getAll();
    this.activeWalletId = this.wallets[0]?.id;
  }

  @action
  save(input: { id?: string; name: string; address: string; type: EWalletType }): void {
    const wallet = input.id
      ? new Wallet(input.id, input.name, input.address, input.type, this.repo.getById(input.id)?.createdAt ?? new Date().toISOString())
      : Wallet.create({ name: input.name, address: input.address, type: input.type });

    this.repo.save(wallet);
    this.hydrate();
  }

  async remove(id: string): Promise<void> {
    const confirmed = await this.deleteUseCase.execute(id);
    if (!confirmed) return;

    this.hydrate();

    if (this.activeWalletId === id) {
      this.activeWalletId = this.wallets[0]?.id;
    }
  }
}
