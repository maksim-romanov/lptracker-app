import { useLocalSearchParams } from "expo-router";
import { PositionDetailScreen } from "positions/presentation/screens/PositionDetailScreen";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PositionDetailScreen id={id} />;
}
