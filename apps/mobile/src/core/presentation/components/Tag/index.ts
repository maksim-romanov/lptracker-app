import { FollowingTag } from "./FollowingTag";
import { withFollowingAnimation } from "./withFollowingAnimation";

export { ChainTag } from "./ChainTag";
export { FeeBpsTag } from "./FeeBpsTag";
export { FollowingTag } from "./FollowingTag";
export { InRangeTag } from "./InRangeTag";
export { Tag } from "./Tag";
export { VariantTag } from "./VariantTag";
export { withFollowingAnimation } from "./withFollowingAnimation";

/** Animated variant — entrance/exit + dust cloud, takes `active` prop. */
export const AnimatedFollowingTag = withFollowingAnimation(FollowingTag);
