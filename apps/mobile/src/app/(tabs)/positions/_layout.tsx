import { Stack, useRouter } from "expo-router";

export default function PositionsLayout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Positions",
          headerLargeTitle: true,
          headerLargeTitleEnabled: true,
          headerTransparent: true,
          unstable_headerRightItems: () => [
            {
              type: "button",
              label: "Wallets",
              icon: { type: "sfSymbol", name: "wallet.bifold" },
              onPress: () => router.navigate("/wallets"),
            },
          ],
        }}
      />
    </Stack>
  );
}
