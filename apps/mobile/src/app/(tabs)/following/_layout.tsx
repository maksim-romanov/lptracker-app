import { Stack, useRouter } from "expo-router";

export default function FollowingLayout() {
  const router = useRouter();

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
              type: "button",
              label: "Wallets",
              icon: { type: "sfSymbol", name: "wallet.pass" },
              onPress: () => router.navigate("/wallets"),
            },
          ],
        }}
      />
    </Stack>
  );
}
