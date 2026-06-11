import { UseCase } from "core/domain/base/usecase";
import { MembershipStore } from "membership/presentation/membership.store";
import { inject, injectable } from "tsyringe";
import type { WalletsRepository } from "wallets/data/wallets.repository";
import { WALLETS_REPOSITORY } from "wallets/di/tokens";
import { EWalletType, Wallet } from "wallets/domain/entities/wallet.entity";
import type { TWalletDraft } from "wallets/domain/schemas/wallet.schema";
import type { WidgetSnapshotService } from "widgets/application/widget-snapshot.service";
import { WIDGET_SNAPSHOT_SERVICE } from "widgets/di/tokens";

type TInput = TWalletDraft & { id?: string };

const normalizeAddress = (address: string, type: EWalletType): string => (type === EWalletType.ERC20 ? address.toLowerCase() : address);

@injectable()
export class SaveWalletUseCase extends UseCase<boolean, TInput> {
  constructor(
    @inject(WALLETS_REPOSITORY) private readonly repo: WalletsRepository,
    @inject(MembershipStore) private readonly membership: MembershipStore,
    @inject(WIDGET_SNAPSHOT_SERVICE) private readonly widgetSnapshot: WidgetSnapshotService,
  ) {
    super();
  }

  async execute(input: TInput): Promise<boolean> {
    const ok = input.id ? this.update(input.id, input) : this.create(input);
    if (ok) {
      void this.widgetSnapshot.revalidate().catch((error) => {
        this.logger.warn("Widget revalidation after wallet save failed", { error });
      });
    }
    return ok;
  }

  private create(input: TWalletDraft): boolean {
    const currentCount = this.repo.getAll().length;
    if (!this.membership.canAddWallet(currentCount)) {
      const max = this.membership.current.limits.maxWallets;
      this.alert.error(`Your plan allows ${max} wallets.`, { title: "Wallet limit reached" });
      return false;
    }

    const target = normalizeAddress(input.address, input.type);
    const exists = this.repo.getAll().some((w) => normalizeAddress(w.address, w.type) === target);
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

    const target = normalizeAddress(input.address, input.type);
    const previous = normalizeAddress(existing.address, existing.type);
    if (target !== previous) {
      const dup = this.repo.getAll().some((w) => w.id !== id && normalizeAddress(w.address, w.type) === target);
      if (dup) {
        this.alert.error("Another wallet already uses this address.", { title: "Duplicate wallet" });
        return false;
      }
    }

    const wallet = new Wallet(
      existing.id,
      input.name.length > 0 ? input.name : existing.name,
      input.address,
      input.type,
      input.chainIds,
      existing.createdAt,
    );
    this.repo.save(wallet);
    this.logger.debug("Wallet updated", { id: wallet.id, name: wallet.name });
    return true;
  }
}
