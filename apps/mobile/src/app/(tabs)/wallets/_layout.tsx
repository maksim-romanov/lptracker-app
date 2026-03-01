import { Stack, useRouter } from "expo-router";

export default function WalletsLayout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Wallets",
          headerLargeTitle: true,
          headerLargeTitleEnabled: true,
          headerTransparent: true,
          unstable_headerRightItems: () => [
            {
              type: "button",
              label: "Add",
              icon: { type: "sfSymbol", name: "plus" },
              onPress: () => router.navigate("/wallets/new"),
            },
          ],
        }}
      />

      {/* <Stack.Screen name="new" options={{ title: "New Wallet" }} />
      <Stack.Screen name="[walletId]" options={{ title: "Edit Wallet" }} /> */}
    </Stack>
  );
}
