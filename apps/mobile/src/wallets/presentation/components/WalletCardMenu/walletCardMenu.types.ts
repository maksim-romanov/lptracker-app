import type { Wallet } from "wallets/domain/entities/wallet.entity";

export type TWalletCardMenuProps = React.PropsWithChildren<{
  wallet: Wallet;
  onEdit: () => void;
  onDelete: () => void;
}>;
