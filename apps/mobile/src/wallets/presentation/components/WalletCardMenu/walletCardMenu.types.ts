import type { Wallet } from "wallets/domain/entities/wallet.entity";

export type TWalletCardMenuProps = React.PropsWithChildren<{
  wallet: Wallet;
  onViewPositions: () => void;
  onEdit: () => void;
  onDelete: () => void;
}>;
