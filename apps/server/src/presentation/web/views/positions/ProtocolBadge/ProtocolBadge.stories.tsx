import type { Meta, StoryObj } from "@storybook/html-vite";

import { ProtocolBadge } from "./ProtocolBadge";

const meta: Meta = {
  title: "Positions/ProtocolBadge",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Known = { render: () => String(<ProtocolBadge protocol={{ slug: "uniswap-v3", label: "Uniswap V3" }} />) } as Story;

// A protocol with no brand colour on file: the mark falls back to the text colour rather than
// disappearing, and the name still says which one it is.
export const Unregistered = { render: () => String(<ProtocolBadge protocol={{ slug: "aerodrome", label: "Aerodrome" }} />) } as Story;
