import { useEffect } from "react";

import { container } from "core/di/container";
import { WalletForm } from "wallets/presentation/components/WalletForm";
import { WalletDraftStore } from "wallets/presentation/wallet-draft.store";

const NewWalletScreen = () => {
  useEffect(() => {
    container.resolve(WalletDraftStore).resetForCreate();
  }, []);

  return <WalletForm />;
};

export default NewWalletScreen;
