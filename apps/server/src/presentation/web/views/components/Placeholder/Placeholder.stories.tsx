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
      <Placeholder icon={<Icon name="inbox" size={28} />} title="Nothing here yet">
        <p>There's nothing to show for this view.</p>
      </Placeholder>,
    ),
} as Story;

export const WithAction = {
  render: () =>
    String(
      <Placeholder icon={<Icon name="inbox" size={28} />} title="Nothing here yet">
        <p>There's nothing to show for this view.</p>
        <Button class="px-3 py-2">Add a wallet</Button>
      </Placeholder>,
    ),
} as Story;
