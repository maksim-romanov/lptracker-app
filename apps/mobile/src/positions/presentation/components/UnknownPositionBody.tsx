import { Stack } from "@grapp/stacks";
import { Card, Text } from "core/presentation/components";
import { observer } from "mobx-react-lite";
import type { TGatewayPosition } from "positions/domain/types";

interface Props {
  readonly position: TGatewayPosition;
}

export const UnknownPositionBody = observer(function UnknownPositionBody({ position }: Props) {
  return (
    <Card variant="outlined" padding="lg">
      <Stack space={1}>
        <Text variant="label" color="muted" uppercase>
          Unsupported protocol
        </Text>
        <Text variant="body" weight="bold">
          {position.protocol}
        </Text>
        <Text variant="bodySmall" color="muted">
          {position.ref}
        </Text>
        <Text variant="bodySmall" color="muted">
          This position requires an app update to render its details.
        </Text>
      </Stack>
    </Card>
  );
});
