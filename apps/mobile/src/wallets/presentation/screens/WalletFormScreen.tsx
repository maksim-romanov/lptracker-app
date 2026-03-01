import React from "react";
import { type TextInput as RNTextInput, View } from "react-native";

import { useForm } from "@tanstack/react-form";
import { container } from "core/di/container";
import { Button } from "core/presentation/components";
import { LabeledTextInput, TextInputAdapter } from "core/presentation/components/form/Textinput";
import { withERC20 } from "core/presentation/components/TextInput/withERC20";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView, KeyboardStickyView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";
import { isAddress } from "viem";
import { WALLETS_STORE } from "wallets/di/tokens";
import { EWalletType } from "wallets/domain/entities/wallet.entity";
import type { WalletsStore } from "wallets/presentation/wallets.store";

const store = container.resolve<WalletsStore>(WALLETS_STORE);

const ERC20TextInputAdapter = withERC20(TextInputAdapter);

type TProps = {
  walletId?: string;
};

export function WalletFormScreen({ walletId }: TProps) {
  const router = useRouter();

  const addressInput = React.useRef<RNTextInput>(null);

  React.useEffect(() => {
    if (addressInput.current) setTimeout(() => addressInput.current?.focus(), 500);
  }, []);

  const existing = walletId ? store.wallets.find((w) => w.id === walletId) : undefined;
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
    <View style={styles.container}>
      <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" bottomOffset={20}>
        <form.Field name="name">{(field) => <TextInputAdapter field={field} label="Wallet name" />}</form.Field>

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
          {(field) => <ERC20TextInputAdapter ref={addressInput} field={field} />}
        </form.Field>

        <LabeledTextInput label="Network" value="ERC-20" editable={false} placeholder="Wallet type" />
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
        <View style={styles.footer}>
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
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.xl,
  },

  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
}));
