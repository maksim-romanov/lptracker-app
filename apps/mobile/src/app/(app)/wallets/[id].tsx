import { useLocalSearchParams } from "expo-router";
import { WalletFormScreen } from "wallets/presentation/screens/WalletFormScreen";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <WalletFormScreen walletId={id} />;
}
