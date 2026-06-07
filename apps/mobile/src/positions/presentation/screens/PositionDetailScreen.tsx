import { ActivityIndicator, ScrollView, View } from "react-native";

import { PROTOCOL_PLUGINS } from "app/protocol-plugins";
import { EmptyState } from "core/presentation/components";
import { type Href, useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { lookupPlugin } from "positions/domain/plugin-registry";
import { PositionDetailShell } from "positions/presentation/components/PositionDetailShell";
import { UnknownPositionBody } from "positions/presentation/components/UnknownPositionBody";
import { usePositionByRefQuery } from "positions/presentation/hooks/usePositionByRefQuery";
import { StyleSheet } from "react-native-unistyles";

type TProps = {
  positionRef: string;
};

export const PositionDetailScreen = observer(function PositionDetailScreen({ positionRef }: TProps) {
  const router = useRouter();
  const query = usePositionByRefQuery(positionRef);

  if (query.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (query.error || !query.data) {
    return (
      <View style={styles.emptyRoot}>
        <View style={styles.beforeStack} />
        <EmptyState
          icon="search-outline"
          tint="primary"
          title="Position not found"
          description="This position no longer exists or has been removed."
          actionLabel="Back to positions"
          actionIcon="chevron-back-outline"
          onAction={() => router.replace("/positions" as Href)}
        />
        <View style={styles.afterStack} />
      </View>
    );
  }

  const { data: position, tokens } = query.data;
  const plugin = lookupPlugin(position.extension.type, position.extension.version, PROTOCOL_PLUGINS);

  if (!plugin) {
    return (
      <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
        <UnknownPositionBody position={position} />
      </ScrollView>
    );
  }

  const DetailBody = plugin.components.DetailBody;

  return (
    <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <PositionDetailShell position={position} tokens={tokens} plugin={plugin}>
        <DetailBody position={position} tokens={tokens} />
      </PositionDetailShell>
    </ScrollView>
  );
});

const styles = StyleSheet.create((theme) => ({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing["3xl"],
  },

  emptyRoot: {
    flex: 1,
  },

  beforeStack: {
    flex: 30,
  },

  afterStack: {
    flex: 70,
  },
}));
