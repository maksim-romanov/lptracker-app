import { container } from "core/di/container";
import { action, computed, makeObservable, observable } from "mobx";
import { inject, injectable } from "tsyringe";
import type { WalletsRepository } from "wallets/data/wallets.repository";
import { WALLETS_REPOSITORY } from "wallets/di/tokens";
import { EWalletType, Wallet } from "wallets/domain/entities/wallet.entity";

import { DeleteWalletUseCase } from "../application/usecases/delete-wallet.usecase";

@injectable()
export class WalletsStore {
  @observable wallets: Wallet[] = [];

  constructor(@inject(WALLETS_REPOSITORY) private readonly repo: WalletsRepository) {
    makeObservable(this);
  }

  @computed
  get nextIndex(): number {
    return this.wallets.length + 1;
  }

  @computed
  get isEmpty(): boolean {
    return this.wallets.length === 0;
  }

  @action
  hydrate(): void {
    // this.wallets = this.repo.getAll();
    this.wallets = [
      Wallet.create({ name: "Wallet 1", address: "0x1234567890123456789012345678901234567890", type: EWalletType.ERC20 }),
      Wallet.create({ name: "Wallet 2", address: "0x1234567890123456789012345678901234567890", type: EWalletType.ERC20 }),
      Wallet.create({ name: "Wallet 3", address: "0x1234567890123456789012345678901234567890", type: EWalletType.ERC20 }),
      Wallet.create({ name: "Wallet 4", address: "0x1234567890123456789012345678901234567890", type: EWalletType.ERC20 }),
      Wallet.create({ name: "Wallet 5", address: "0x1234567890123456789012345678901234567890", type: EWalletType.ERC20 }),
      Wallet.create({ name: "Wallet 6", address: "0x1234567890123456789012345678901234567890", type: EWalletType.ERC20 }),
      Wallet.create({ name: "Wallet 7", address: "0x1234567890123456789012345678901234567890", type: EWalletType.ERC20 }),
      Wallet.create({ name: "Wallet 8", address: "0x1234567890123456789012345678901234567890", type: EWalletType.ERC20 }),
      Wallet.create({ name: "Wallet 9", address: "0x1234567890123456789012345678901234567890", type: EWalletType.ERC20 }),
      Wallet.create({ name: "Wallet 10", address: "0x1234567890123456789012345678901234567890", type: EWalletType.ERC20 }),
    ];
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
    const useCase = container.resolve(DeleteWalletUseCase);
    const confirmed = await useCase.execute(id);
    if (confirmed) this.hydrate();
  }
}
