import type { Meta, StoryObj } from "@storybook/html-vite";

import { PositionStatus } from "./PositionStatus";
import type { TPositionRangeTone } from "#features/uniswap-v3/presentation/web/position.web-mapper";

const meta: Meta = {
  title: "Positions/PositionStatus",
};
export default meta;

type Story = StoryObj<typeof meta>;

const TONES: TPositionRangeTone[] = ["in-range", "near-lower", "near-upper", "out-of-range", "closed"];

// Every tone at once: soft fill with loud text is only safe because each pair is held to
// 4.5:1 by packages/theme's contrast test, and this is where that gets looked at.
export const AllTones = {
  render: () =>
    String(
      <span class="flex flex-wrap gap-2">
        {TONES.map((tone) => (
          <PositionStatus tone={tone} />
        ))}
      </span>,
    ),
} as Story;
