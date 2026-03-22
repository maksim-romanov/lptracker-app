import { Button, Host, Image, Menu, Picker, Section, Text } from "@expo/ui/swift-ui";
import { tag } from "@expo/ui/swift-ui/modifiers";
import { container } from "core/di/container";
import { router } from "expo-router";
import { observer } from "mobx-react-lite";
import { withUnistyles } from "react-native-unistyles";
import { WalletsStore } from "wallets/presentation/wallets.store";

const UniImage = withUnistyles(Image);

export const WalletMenuButton = observer(function WalletMenuButton() {
  const store = container.resolve(WalletsStore);

  return (
    <Host matchContents>
      <Menu label={<UniImage systemName="wallet.bifold" size={20} uniProps={(theme) => ({ color: theme.onSurface })} />}>
        <Section title="Wallets">
          <Picker selection={store.activeWalletId} onSelectionChange={(id) => store.setActiveWallet(id as string)}>
            {store.wallets.map((w) => (
              <Text key={w.id} modifiers={[tag(w.id)]}>
                {w.name}
              </Text>
            ))}
          </Picker>
        </Section>
        <Section>
          <Button systemImage="gear" label="Manage Wallets" onPress={() => router.push("/wallets")} />
        </Section>
      </Menu>
    </Host>
  );
});
