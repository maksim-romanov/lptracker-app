import { View } from "react-native";

import { StyleSheet } from "react-native-unistyles";
import tinycolor from "tinycolor2";

import { Symbol } from "../Symbol";
import { Text } from "../Text";

export const GOLD = "#E5B83C";

const BORDER = tinycolor(GOLD).setAlpha(0.65).toRgbString();
const FILL = tinycolor(GOLD).setAlpha(0.14).toRgbString();

/**
 * "Following" status badge — the static, presentation-only chip: gold border,
 * tinted fill, gold star. Animation (entrance/exit + dust cloud) lives in the
 * `withFollowingAnimation` HOC, kept separate so this component stays cheap
 * to mount anywhere in the tree.
 */
export const FollowingTag = () => (
  <View style={styles.clip}>
    <View style={styles.content}>
      <Symbol name="star.fill" size="xs" tintColor={GOLD} />
      {/* Phantom text mirrors sibling Tag.sm typography so the chip's height
          comes from natural line-height — no fixed pixel value. */}
      <Text style={styles.heightAnchor} accessibilityElementsHidden importantForAccessibility="no">
        {" "}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create((theme) => ({
  clip: {
    flexDirection: "row",
    overflow: "hidden",
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: FILL,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  // Mirrors Tag.sm internal text spec — see Tag.tsx `text.variants.size.sm`.
  heightAnchor: {
    fontSize: 11,
    lineHeight: 14,
    width: 0,
  },
}));
