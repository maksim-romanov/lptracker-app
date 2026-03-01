import { Entity } from "core/domain/base/entity";
import * as Crypto from "expo-crypto";

export enum EWalletType {
  ERC20 = "erc20",
  TRC20 = "trc20",
  SPL = "spl",
}

export type TWallet = {
  id: string;
  name: string;
  address: string;
  type: EWalletType;
  createdAt: string;
};

export class Wallet extends Entity<string> {
  constructor(
    id: string,
    public readonly name: string,
    public readonly address: string,
    public readonly type: EWalletType,
    public readonly createdAt: string,
  ) {
    super(id);
  }

  static create(params: { name: string; address: string; type: EWalletType }): Wallet {
    return new Wallet(Crypto.randomUUID(), params.name, params.address, params.type, new Date().toISOString());
  }

  static fromRaw(raw: TWallet): Wallet {
    return new Wallet(raw.id, raw.name, raw.address, raw.type, raw.createdAt);
  }

  toRaw(): TWallet {
    return {
      id: this.id,
      name: this.name,
      address: this.address,
      type: this.type,
      createdAt: this.createdAt,
    };
  }
}
