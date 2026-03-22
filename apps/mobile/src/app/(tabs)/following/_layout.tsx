import { Stack } from "expo-router";
import { WalletMenuButton } from "wallets/presentation/components/WalletMenuButton/WalletMenuButton";

export default function FollowingLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Following",
          headerLargeTitle: true,
          headerLargeTitleEnabled: true,
          headerTransparent: true,
          headerRight: () => <WalletMenuButton />,
        }}
      />
    </Stack>
  );
}
