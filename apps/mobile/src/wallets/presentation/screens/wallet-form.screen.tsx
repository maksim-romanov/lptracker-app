import { View } from "react-native";

import { useForm } from "@tanstack/react-form";
import { container } from "core/di/container";
import { Button, TextInput } from "core/presentation/components";
import { Text } from "core/presentation/components/Text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { isAddress } from "viem";
import { WALLETS_STORE } from "wallets/di/tokens";
import { EWalletType } from "wallets/domain/entities/wallet.entity";
import type { WalletsStore } from "wallets/presentation/wallets.store";

const store = container.resolve<WalletsStore>(WALLETS_STORE);

export function WalletFormScreen() {
  const { theme } = useUnistyles();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const existing = id ? store.wallets.find((w) => w.id === id) : undefined;
  const isEdit = !!existing;

  const form = useForm({
    defaultValues: {
      name: existing?.name ?? `Wallet #${store.nextIndex}`,
      address: existing?.address ?? "",
      type: existing?.type ?? EWalletType.ERC20,
    },
    onSubmit: ({ value }) => {
      store.save({
        id: existing?.id,
        name: value.name,
        address: value.address,
        type: value.type,
      });
      router.back();
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.header}>
        <Text variant="title">{isEdit ? "Edit Wallet" : "Add Wallet"}</Text>
      </View>

      <View style={styles.content}>
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => (!value.trim() ? "Name is required" : undefined),
          }}
        >
          {(field) => (
            <TextInput
              label="Name"
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="My Wallet"
              error={field.state.meta.isTouched ? field.state.meta.errors.join(", ") : undefined}
            />
          )}
        </form.Field>

        <form.Field
          name="address"
          validators={{
            onChange: ({ value }) => {
              if (!value.trim()) return "Address is required";
              if (!isAddress(value)) return "Invalid ERC-20 address";
              return undefined;
            },
          }}
        >
          {(field) => (
            <TextInput
              label="Address"
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="0x..."
              autoCapitalize="none"
              autoCorrect={false}
              error={field.state.meta.isTouched ? field.state.meta.errors.join(", ") : undefined}
            />
          )}
        </form.Field>

        <View>
          <Text variant="label" color="onSurfaceVariant">
            Type
          </Text>
          <TextInput value="ERC-20" editable={false} />
        </View>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              title={isEdit ? "Save" : "Add Wallet"}
              variant="filled"
              disabled={!canSubmit}
              loading={isSubmitting as boolean}
              onPress={form.handleSubmit}
            />
          )}
        </form.Subscribe>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.outlineVariant,
  },

  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
}));
