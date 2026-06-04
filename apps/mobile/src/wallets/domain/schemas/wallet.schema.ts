import * as v from "valibot";
import { EWalletType } from "wallets/domain/entities/wallet.entity";

const ETH_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const TRON_ADDRESS = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
const SOLANA_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const ADDRESS_BY_TYPE: Record<EWalletType, { pattern: RegExp; message: string }> = {
  [EWalletType.ERC20]: { pattern: ETH_ADDRESS, message: "Must be a 0x… address (40 hex chars)" },
  [EWalletType.TRC20]: { pattern: TRON_ADDRESS, message: "Must be a Tron address (T…)" },
  [EWalletType.SPL]: { pattern: SOLANA_ADDRESS, message: "Must be a Solana address (base58, 32–44 chars)" },
};

export const WalletDraftSchema = v.pipe(
  v.object({
    name: v.pipe(v.string(), v.trim(), v.maxLength(40, "Keep it under 40 characters")),
    type: v.enum(EWalletType, "Pick a wallet type"),
    address: v.pipe(v.string("Address is required"), v.trim(), v.minLength(1, "Address is required")),
    chainIds: v.pipe(v.array(v.number()), v.minLength(1, "Pick at least one network")),
  }),
  v.forward(
    v.partialCheck(
      [["type"], ["address"]],
      ({ type, address }) => ADDRESS_BY_TYPE[type].pattern.test(address),
      ({ input }) => ADDRESS_BY_TYPE[input.type].message,
    ),
    ["address"],
  ),
);

export type TWalletDraft = v.InferOutput<typeof WalletDraftSchema>;
