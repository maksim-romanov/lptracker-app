/** biome-ignore-all lint/a11y/useValidAriaRole: <explanation> */
import { Button, ContextMenu, Host, Section } from "@expo/ui/swift-ui";

import type { TWalletCardMenuProps } from "./walletCardMenu.types";

export function WalletCardMenu({ children, onEdit, onDelete }: TWalletCardMenuProps) {
  return (
    <Host>
      <ContextMenu>
        <ContextMenu.Items>
          <Section title="Actions">
            <Button systemImage="pencil" label="Edit" onPress={onEdit} />
            <Button systemImage="trash" label="Delete" role="destructive" onPress={onDelete} />
          </Section>
        </ContextMenu.Items>

        <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}
