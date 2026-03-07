import { StyleSheet, Text } from "react-native";

import { CHAIN_BY_ID, type ChainId } from "core/config/chains";

import { Tag } from "./Tag";

export const ChainTag = ({ chainId }: { chainId: ChainId }) => {
  const chain = CHAIN_BY_ID.get(chainId);

  if (!chain) throw new Error("Unknown error");

  return (
    <Tag color={chain.color}>
      <Text style={styles.text}>{chain.label}</Text>
    </Tag>
  );
};

const styles = StyleSheet.create({
  text: {
    textTransform: "uppercase",
  },
});
