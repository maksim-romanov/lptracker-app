import { container } from "core/di/container";
import { router, Stack } from "expo-router";
import { observer } from "mobx-react-lite";
import { WalletsStore } from "wallets/presentation/wallets.store";

function truncateAddress(address: string): string {
  return `…${address.slice(-6)}`;
}

export default observer(function FollowingLayout() {
  const store = container.resolve(WalletsStore);
  const wallet = store.activeWallet;

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Following",
          headerLargeTitle: true,
          headerLargeTitleEnabled: true,
          headerTransparent: true,
          unstable_headerRightItems: () => [
            {
              type: "menu",
              label: wallet ? truncateAddress(wallet.address) : "Wallets",
              icon: { type: "sfSymbol", name: "wallet.bifold" },
              changesSelectionAsPrimaryAction: true,
              menu: {
                items: [
                  {
                    type: "submenu",
                    label: "Wallets",
                    inline: true,
                    items: store.wallets.map((w) => ({
                      type: "action" as const,
                      label: w.name,
                      state: (w.id === store.activeWalletId ? "on" : "off") as
                        | "on"
                        | "off",
                      onPress: () => store.setActiveWallet(w.id),
                    })),
                  },
                  {
                    type: "submenu",
                    label: "Actions",
                    inline: true,
                    items: [
                      {
                        type: "action" as const,
                        label: "Manage Wallets",
                        icon: { type: "sfSymbol" as const, name: "gear" },
                        onPress: () => router.push("/wallets"),
                      },
                    ],
                  },
                ],
              },
            },
          ],
        }}
      />
    </Stack>
  );
});
