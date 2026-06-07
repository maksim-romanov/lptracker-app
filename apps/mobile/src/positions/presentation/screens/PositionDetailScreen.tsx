import { ActivityIndicator, View } from "react-native";

import { EmptyState } from "core/presentation/components";
import { type Href, useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { usePositionByRefQuery } from "positions/presentation/hooks/usePositionByRefQuery";
import { StyleSheet } from "react-native-unistyles";

import { renderPositionDetail } from "../render-position-detail";

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
  return <>{renderPositionDetail(position, tokens)}</>;
});

const styles = StyleSheet.create(() => ({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyRoot: { flex: 1 },
  beforeStack: { flex: 30 },
  afterStack: { flex: 70 },
}));
