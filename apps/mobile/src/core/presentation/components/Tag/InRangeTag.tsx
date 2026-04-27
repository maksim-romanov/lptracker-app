import { View } from "react-native";

import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { Tag } from "./Tag";

export const InRangeTag = ({ inRange }: { inRange: boolean }) => {
  const { theme } = useUnistyles();
  const color = inRange ? theme.success : theme.warning;

  return (
    <Tag color={color} leading={<View style={[styles.dot, { backgroundColor: color }]} />}>
      {inRange ? "In range" : "Out of range"}
    </Tag>
  );
};

const styles = StyleSheet.create(() => ({
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
}));
