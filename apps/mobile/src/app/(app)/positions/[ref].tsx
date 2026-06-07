import { useLocalSearchParams } from "expo-router";
import { PositionDetailScreen } from "positions/presentation/screens/PositionDetailScreen";

export default function Screen() {
  const { ref } = useLocalSearchParams<{ ref: string }>();
  const decoded = ref ? decodeURIComponent(ref) : "";
  return <PositionDetailScreen positionRef={decoded} />;
}
