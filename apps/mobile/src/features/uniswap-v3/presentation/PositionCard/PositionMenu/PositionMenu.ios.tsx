import * as ContextMenu from "zeego/context-menu";

import type { TPositionCardMenuProps } from "./PositionMenu.types";

export function PositionMenu({ children, isFollowing, onToggleFollow, onOpenUniswap }: TPositionCardMenuProps) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{children}</ContextMenu.Trigger>

      <ContextMenu.Content>
        <ContextMenu.Label>Actions</ContextMenu.Label>
        <ContextMenu.Item key="toggle-follow" onSelect={onToggleFollow}>
          <ContextMenu.ItemIcon ios={{ name: isFollowing ? "star.fill" : "star" }} />
          <ContextMenu.ItemTitle>{isFollowing ? "Unfollow" : "Follow"}</ContextMenu.ItemTitle>
        </ContextMenu.Item>
        <ContextMenu.Item key="open-uniswap" onSelect={onOpenUniswap}>
          <ContextMenu.ItemIcon ios={{ name: "arrow.up.right.square" }} />
          <ContextMenu.ItemTitle>Open on Uniswap</ContextMenu.ItemTitle>
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

// import { View } from "react-native";

// import { Button, ContextMenu, Host, Section } from "@expo/ui/swift-ui";

// import type { TPositionCardMenuProps } from "./PositionMenu.types";

// // TODO: Switch back to @expo/ui when FlatList item sizing bug is fixed
// // @expo/ui/swift-ui Host + ContextMenu breaks FlatList — cards render at half height
// export function PositionCardMenu({ children, isFollowing, onToggleFollow }: TPositionCardMenuProps) {
//   return (
//     <Host>
//       <ContextMenu>
//         <ContextMenu.Items>
//           <Section title="Actions">
//             <Button systemImage={isFollowing ? "star.fill" : "star"} label={isFollowing ? "Unfollow" : "Follow"} onPress={onToggleFollow} />
//           </Section>
//         </ContextMenu.Items>

//         <ContextMenu.Trigger>
//           <View collapsable={false}>{children}</View>
//         </ContextMenu.Trigger>
//       </ContextMenu>
//     </Host>
//   );
// }
