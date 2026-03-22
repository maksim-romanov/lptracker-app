import { Stack } from "expo-router";
import { WalletMenuButton } from "wallets/presentation/components/WalletMenuButton/WalletMenuButton";

export default function PositionsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Positions",
          headerLargeTitle: true,
          headerLargeTitleEnabled: true,
          headerTransparent: true,
          headerRight: () => <WalletMenuButton />,
        }}
      />
    </Stack>
  );
}
