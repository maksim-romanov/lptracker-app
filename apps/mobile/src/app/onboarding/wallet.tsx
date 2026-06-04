import { useEffect } from "react";

import { container } from "core/di/container";
import { type Href, useRouter } from "expo-router";
import { WalletForm } from "wallets/presentation/components/WalletForm";
import { WalletDraftStore } from "wallets/presentation/wallet-draft.store";

export default function Screen() {
  const router = useRouter();

  useEffect(() => {
    container.resolve(WalletDraftStore).resetForCreate();
  }, []);

  return <WalletForm onSaved={() => router.replace("/positions" as Href)} networksHref={"/onboarding/networks" as Href} />;
}
