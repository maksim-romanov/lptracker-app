import { Box, Inline, Stack } from "@grapp/stacks";
import { Text } from "core/presentation/components";
import { AdaptiveTag } from "core/presentation/components/Tag";
import { StyleSheet } from "react-native-unistyles";
import type { EWalletType, Wallet } from "wallets/domain/entities/wallet.entity";

type TProps = {
  wallet: Wallet;
  isActive?: boolean;
};

const TYPE_LABELS: Record<EWalletType, { label: string; color: string }> = {
  erc20: { label: "ERC-20", color: "#627EEA" },
  trc20: { label: "TRC-20", color: "#FF0013" },
  spl: { label: "SPL", color: "#9945FF" },
};

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletCard({ wallet, isActive }: TProps) {
  const typeInfo = TYPE_LABELS[wallet.type];
  styles.useVariants({ active: isActive });

  return (
    <Box style={styles.container}>
      <Stack space={2}>
        <Inline alignX="between" alignY="center">
          <Text variant="headline">{wallet.name}</Text>
          <AdaptiveTag color={typeInfo.color}>{typeInfo.label}</AdaptiveTag>
        </Inline>

        <Text variant="bodySmall" color="muted">
          {truncateAddress(wallet.address)}
        </Text>
      </Stack>
    </Box>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.surfaceContainer,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    borderColor: theme.outlineVariant,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,

    variants: {
      active: {
        true: {
          boxShadow: `0 0 0 1px ${theme.primary}`,
          shadowColor: theme.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 4,
          elevation: 2,
        },
      },
    },
  },
}));
