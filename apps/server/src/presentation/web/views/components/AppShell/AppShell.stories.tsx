import type { Meta, StoryObj } from "@storybook/html-vite";

import { AppShell } from "./AppShell";

const meta: Meta = {
  title: "AppShell",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {
  render: () => String(<AppShell class="shell-grid shell-content">Shell content</AppShell>),
} as Story;
