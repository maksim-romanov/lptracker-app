import type { Meta, StoryObj } from "@storybook/html-vite";

import { PositionsLayoutToggle } from "./PositionsLayoutToggle";

const meta: Meta = {
  title: "Positions/PositionsLayoutToggle",
};
export default meta;

type Story = StoryObj<typeof meta>;

// Server-rendered state only: which option is pressed is settled by layout_controller on
// connect, because the shell renders before the board and cannot know what the client asks for.
export const Default = { render: () => String(<PositionsLayoutToggle />) } as Story;
