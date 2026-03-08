import * as ContextMenu from "zeego/context-menu";

import type { TWalletCardMenuProps } from "./walletCardMenu.types";

export function WalletCardMenu({ children, onEdit, onDelete }: TWalletCardMenuProps) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{children}</ContextMenu.Trigger>

      <ContextMenu.Content>
        <ContextMenu.Label>Actions</ContextMenu.Label>
        <ContextMenu.Item key="edit" onSelect={onEdit}>
          <ContextMenu.ItemIcon ios={{ name: "pencil" }} />
          <ContextMenu.ItemTitle>Edit</ContextMenu.ItemTitle>
        </ContextMenu.Item>
        <ContextMenu.Item key="delete" onSelect={onDelete} destructive>
          <ContextMenu.ItemIcon ios={{ name: "trash" }} />
          <ContextMenu.ItemTitle>Delete</ContextMenu.ItemTitle>
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

// TODO: Switch back to @expo/ui when FlatList item sizing bug is fixed
// @expo/ui/swift-ui Host + ContextMenu breaks FlatList — cards render at half height
//
// import { Button, ContextMenu, Host, Section } from "@expo/ui/swift-ui";
//
// export function WalletCardMenu({ children, onEdit, onDelete }: TWalletCardMenuProps) {
//   return (
//     <Host>
//       <ContextMenu>
//         <ContextMenu.Items>
//           <Section title="Actions">
//             <Button systemImage="pencil" label="Edit" onPress={onEdit} />
//             <Button systemImage="trash" label="Delete" role="destructive" onPress={onDelete} />
//           </Section>
//         </ContextMenu.Items>
//         <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
//       </ContextMenu>
//     </Host>
//   );
// }
