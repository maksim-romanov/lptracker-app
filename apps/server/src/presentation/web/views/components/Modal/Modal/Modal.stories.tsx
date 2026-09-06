import type { Meta, StoryObj } from "@storybook/html-vite";

import { inRange } from "../../../positions/__stories__/mocks";
import { PositionDetail } from "../../../positions/PositionDetail/PositionDetail";
import { Modal } from "./Modal";

const meta: Meta = {
  title: "Modal",
};
export default meta;

type Story = StoryObj<typeof meta>;

// `open` forces the native <dialog open> attribute so it renders inline in the canvas instead of
// its browser-default `display: none`.
export const Default = {
  render: () =>
    String(
      <Modal id="modal-story" open>
        <p>Modal content</p>
      </Modal>,
    ),
} as Story;

// Real composition, same as Layout.tsx's position-modal: the chrome stays generic, the domain
// content (positions/PositionDetail) is composed in as children.
export const WithPositionDetail = {
  render: () =>
    String(
      <Modal id="modal-position-story" title="Position details" open bodyClass="flex w-full max-w-[640px] flex-col gap-4 p-4">
        <PositionDetail card={inRange} />
      </Modal>,
    ),
} as Story;
