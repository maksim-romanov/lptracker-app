import { UseCase } from "core/domain/base/usecase";
import { inject, injectable } from "tsyringe";
import type { WalletsRepository } from "wallets/data/wallets.repository";
import { WALLETS_REPOSITORY } from "wallets/di/tokens";
import { Wallet } from "wallets/domain/entities/wallet.entity";
import type { TWalletDraft } from "wallets/domain/schemas/wallet.schema";

type Input = TWalletDraft & { id?: string };

@injectable()
export class SaveWalletUseCase extends UseCase<boolean, Input> {
  constructor(@inject(WALLETS_REPOSITORY) private readonly repo: WalletsRepository) {
    super();
  }

  async execute(input: Input): Promise<boolean> {
    if (input.id) return this.update(input.id, input);
    return this.create(input);
  }

  private create(input: TWalletDraft): boolean {
    const exists = this.repo.getAll().some((w) => w.address.toLowerCase() === input.address.toLowerCase());
    if (exists) {
      this.alert.error("A wallet with this address already exists.", { title: "Duplicate wallet" });
      return false;
    }

    const name = input.name.length > 0 ? input.name : `Wallet ${this.repo.getNextIndex()}`;
    const wallet = Wallet.create({ ...input, name });
    this.repo.save(wallet);
    this.logger.debug("Wallet created", { id: wallet.id, name: wallet.name });
    return true;
  }

  private update(id: string, input: TWalletDraft): boolean {
    const existing = this.repo.getById(id);
    if (!existing) {
      this.alert.error("This wallet no longer exists.", { title: "Not found" });
      return false;
    }

    if (input.address.toLowerCase() !== existing.address.toLowerCase()) {
      const dup = this.repo.getAll().some((w) => w.id !== id && w.address.toLowerCase() === input.address.toLowerCase());
      if (dup) {
        this.alert.error("Another wallet already uses this address.", { title: "Duplicate wallet" });
        return false;
      }
    }

    const wallet = new Wallet(
      existing.id,
      input.name.length > 0 ? input.name : existing.name,
      input.address,
      existing.type,
      input.chainIds,
      existing.createdAt,
    );
    this.repo.save(wallet);
    this.logger.debug("Wallet updated", { id: wallet.id, name: wallet.name });
    return true;
  }
}
