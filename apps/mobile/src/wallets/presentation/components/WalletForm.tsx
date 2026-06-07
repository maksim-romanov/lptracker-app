import { View } from "react-native";

import { Stack } from "@grapp/stacks";
import { NETWORKS } from "@mars-909/catalog";
import { container } from "core/di/container";
import { Button, Card, Icon, NetworkStack, Text, TextField } from "core/presentation/components";
import { type Href, useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { SaveWalletUseCase } from "wallets/application/usecases/save-wallet.usecase";
import { WalletDraftStore } from "wallets/presentation/wallet-draft.store";
import { WalletsStore } from "wallets/presentation/wallets.store";

const TOTAL_CHAINS = NETWORKS.length;

const DEFAULT_NETWORKS_HREF = "/wallets/networks" as Href;

const ChevronIcon = withUnistyles(Icon, (theme) => ({ color: theme.onSurfaceVariant }));

type Props = {
  onSaved?: () => void;
  networksHref?: Href;
};

export const WalletForm = observer(({ onSaved, networksHref = DEFAULT_NETWORKS_HREF }: Props) => {
  const router = useRouter();
  const draft = container.resolve(WalletDraftStore);

  const onSubmit = async () => {
    draft.markSubmitted();
    if (!draft.isValid) return;

    const saved = await container.resolve(SaveWalletUseCase).execute({ ...draft.values, id: draft.id });
    if (!saved) return;

    container.resolve(WalletsStore).hydrate();
    if (onSaved) onSaved();
    else router.back();
  };

  const errors = draft.errors;
  const addressError = errors.address && (draft.address.length > 0 || draft.showErrors) ? errors.address : undefined;
  const networksError = draft.showErrors ? errors.chainIds : undefined;

  return (
    <KeyboardAwareScrollView
      mode="layout"
      bottomOffset={20}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.fields}>
        <Stack space={6}>
          <Stack space={2}>
            <SectionLabel>Label · Optional</SectionLabel>
            <TextField
              value={draft.name}
              onChangeText={(v) => draft.setName(v)}
              placeholder={draft.isEdit ? draft.name || "Untitled" : "Main wallet"}
              autoCorrect={false}
              returnKeyType="done"
              error={draft.showErrors ? errors.name : undefined}
            />
          </Stack>

          <Stack space={2}>
            <SectionLabel>Wallet address</SectionLabel>
            <TextField
              value={draft.address}
              onChangeText={(v) => draft.setAddress(v)}
              placeholder="0x…"
              autoCorrect={false}
              autoCapitalize="none"
              autoComplete="off"
              multiline
              helper="Paste any EVM address."
              error={addressError}
            />
          </Stack>

          <Stack space={2}>
            <SectionLabel>Networks</SectionLabel>
            <Card variant="outlined" padding="none" onPress={() => router.push(networksHref)}>
              <View style={styles.networkRow}>
                <View style={styles.networkStack}>
                  <NetworkStack chainIds={draft.chainIds} size="xs" max={6} />
                </View>
                <Text variant="bodySmall" color="muted">
                  {draft.chainIds.length} of {TOTAL_CHAINS}
                </Text>
                <ChevronIcon name="chevron-forward-outline" size="sm" />
              </View>
            </Card>
            {networksError ? (
              <Text variant="bodySmall" color="error">
                {networksError}
              </Text>
            ) : null}
          </Stack>
        </Stack>
      </View>

      <View style={styles.footer}>
        <Button
          title={draft.isEdit ? "Save changes" : "Track wallet"}
          variant="primary"
          size="lg"
          disabled={!draft.isValid}
          onPress={onSubmit}
        />
      </View>
    </KeyboardAwareScrollView>
  );
});

const SectionLabel = ({ children }: { children: string }) => (
  <Text variant="label" weight="bold" color="muted" uppercase>
    {children}
  </Text>
);

const styles = StyleSheet.create((theme, rt) => ({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: Math.max(rt.insets.bottom, theme.spacing.md),
  },

  fields: {
    flex: 1,
  },

  networkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.md,
    minHeight: 44,
  },

  networkStack: {
    flex: 1,
    flexDirection: "row",
  },

  footer: {
    paddingTop: theme.spacing.md,
  },
}));
