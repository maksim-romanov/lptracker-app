import { container } from "core/di/container";
import { type Href, Redirect } from "expo-router";
import { WalletsStore } from "wallets/presentation/wallets.store";

export default function Index() {
  const store = container.resolve(WalletsStore);
  return <Redirect href={(store.isEmpty ? "/onboarding" : "/positions") as Href} />;
}
