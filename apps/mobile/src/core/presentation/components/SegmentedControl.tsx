import { Pressable, View } from "react-native";

import { StyleSheet } from "react-native-unistyles";

import { Text } from "./Text";

type Option<T extends string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  options: ReadonlyArray<Option<T>>;
  value: T;
  onChange: (value: T) => void;
};

export const SegmentedControl = <T extends string>({ options, value, onChange }: Props<T>) => (
  <View style={styles.track}>
    {options.map((opt) => {
      const selected = opt.value === value;
      return <Segment key={opt.value} label={opt.label} selected={selected} onPress={() => onChange(opt.value)} />;
    })}
  </View>
);

const Segment = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => {
  styles.useVariants({ selected });
  return (
    <Pressable onPress={onPress} style={styles.segment}>
      <Text variant="label" weight={selected ? "bold" : "medium"} style={styles.segmentLabel} color={selected ? undefined : "muted"}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  track: {
    flexDirection: "row",
    backgroundColor: theme.surfaceContainer,
    borderRadius: theme.radius.full,
    padding: theme.spacing.xs,
    gap: theme.spacing.xs,
  },

  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,

    variants: {
      selected: {
        true: {
          backgroundColor: theme.surface,
        },
        false: {},
      },
    },
  },

  segmentLabel: {
    textTransform: "uppercase",
  },
}));
