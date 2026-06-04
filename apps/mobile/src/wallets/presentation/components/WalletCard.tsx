import { Box } from "@grapp/stacks";
import { Card, IdentityAvatar, NetworkStack, Text } from "core/presentation/components";
import { truncateAddress } from "core/presentation/utils/format";
import { useUnistyles } from "react-native-unistyles";

export type WalletVM = {
  id: string;
  name: string;
  address: string;
  /** Chains where the wallet has any activity. */
  chainIds: number[];
};

type Props = {
  wallet: WalletVM;
  onPress?: () => void;
};

export const WalletCard = ({ wallet, onPress }: Props) => {
  const { theme } = useUnistyles();

  return (
    <Card variant="outlined" padding="lg" onPress={onPress} style={{ backgroundColor: theme.surface }}>
      <Box direction="row" alignY="center" gap={3}>
        <IdentityAvatar seed={wallet.address} size="md" />

        <Box flex="fluid">
          <Text variant="headline" weight="bold" numberOfLines={1}>
            {wallet.name}
          </Text>
          <Text variant="bodySmall" color="muted">
            {truncateAddress(wallet.address)}
          </Text>
        </Box>

        <NetworkStack chainIds={wallet.chainIds} size="sm" max={4} />
      </Box>
    </Card>
  );
};
