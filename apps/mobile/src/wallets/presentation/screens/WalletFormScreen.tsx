import { useEffect } from "react";

import { container } from "core/di/container";
import { EmptyState } from "core/presentation/components";
import { type Href, useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { WalletForm } from "wallets/presentation/components/WalletForm";
import { WalletDraftStore } from "wallets/presentation/wallet-draft.store";
import { WalletsStore } from "wallets/presentation/wallets.store";

type TProps = {
  walletId?: string;
};

export const WalletFormScreen = observer(({ walletId }: TProps) => {
  const router = useRouter();
  const store = container.resolve(WalletsStore);
  const wallet = walletId ? store.wallets.find((w) => w.id === walletId) : undefined;

  // biome-ignore lint/correctness/useExhaustiveDependencies: only re-init when the route id changes; the looked-up wallet ref churns on unrelated store mutations
  useEffect(() => {
    const draft = container.resolve(WalletDraftStore);
    if (wallet) draft.initFromWallet(wallet);
    else if (!walletId) draft.resetForCreate();
  }, [walletId]);

  if (walletId && !wallet) {
    return (
      <EmptyState
        icon="wallet-outline"
        tint="primary"
        title="Wallet not found"
        description="This wallet was removed or doesn't exist on this device."
        actionLabel="Back to wallets"
        actionIcon="chevron-back-outline"
        onAction={() => router.replace("/wallets" as Href)}
      />
    );
  }

  return <WalletForm />;
});
