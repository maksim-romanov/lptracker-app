import type { Meta, StoryObj } from "@storybook/html-vite";

import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { Placeholder } from "./Placeholder";

const meta: Meta = {
  title: "Placeholder",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {
  render: () =>
    String(
      <Placeholder icon={<Icon name="inbox" size={28} />}>
        <p>Nothing here yet.</p>
      </Placeholder>,
    ),
} as Story;

export const WithAction = {
  render: () =>
    String(
      <Placeholder icon={<Icon name="inbox" size={28} />}>
        <p>Nothing here yet.</p>
        <Button class="px-3 py-2">Add a wallet</Button>
      </Placeholder>,
    ),
} as Story;
