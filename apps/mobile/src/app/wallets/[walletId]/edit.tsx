import { useLocalSearchParams } from "expo-router";
import { WalletFormScreen } from "wallets/presentation/screens/WalletFormScreen";

export default function () {
  const { walletId } = useLocalSearchParams<{ walletId: string }>();

  return <WalletFormScreen walletId={walletId} />;
}
