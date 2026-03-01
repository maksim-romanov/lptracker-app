import { Repository } from "core/domain/base/repository";
import { createMMKV } from "react-native-mmkv";
import { injectable } from "tsyringe";
import { type TWallet, Wallet } from "wallets/domain/entities/wallet.entity";

const WALLETS_KEY = "wallets:v1";

@injectable()
export class WalletsRepository extends Repository {
  private readonly storage = createMMKV({ id: "wallets" });

  getAll(): Wallet[] {
    const raw = this.storage.getString(WALLETS_KEY);
    if (!raw) return [];

    const items = JSON.parse(raw) as TWallet[];
    return items.map(Wallet.fromRaw);
  }

  getById(id: string): Wallet | undefined {
    return this.getAll().find((w) => w.id === id);
  }

  save(wallet: Wallet): void {
    const wallets = this.getAll();
    const index = wallets.findIndex((w) => w.id === wallet.id);

    if (index >= 0) {
      wallets[index] = wallet;
    } else {
      wallets.push(wallet);
    }

    this.storage.set(WALLETS_KEY, JSON.stringify(wallets.map((w) => w.toRaw())));
    this.logger.debug("Wallet saved", { id: wallet.id, name: wallet.name });
  }

  delete(id: string): void {
    const wallets = this.getAll().filter((w) => w.id !== id);
    this.storage.set(WALLETS_KEY, JSON.stringify(wallets.map((w) => w.toRaw())));
    this.logger.debug("Wallet deleted", { id });
  }

  getNextIndex(): number {
    return this.getAll().length + 1;
  }
}
