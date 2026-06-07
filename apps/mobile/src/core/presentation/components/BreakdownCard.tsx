import type { ReactNode } from "react";

import { Box, Stack } from "@grapp/stacks";

import { Card } from "./Card";
import { Divider } from "./Divider";
import { Text } from "./Text";

type Props = {
  title: string;
  totalLabel?: string;
  children: ReactNode;
};

export const BreakdownCard = function BreakdownCard({ title, totalLabel, children }: Props) {
  return (
    <Card variant="elevated" padding="lg">
      <Stack space={3}>
        <Box direction="row" alignY="center">
          <Box flex="fluid">
            <Text variant="headline" weight="bold">
              {title}
            </Text>
          </Box>
          {totalLabel && (
            <Text variant="headline" weight="bold">
              {totalLabel}
            </Text>
          )}
        </Box>
        <Divider />
        <Stack space={3}>{children}</Stack>
      </Stack>
    </Card>
  );
};
