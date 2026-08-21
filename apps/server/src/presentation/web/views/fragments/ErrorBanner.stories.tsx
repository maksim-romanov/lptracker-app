import type { Meta, StoryObj } from "@storybook/html-vite";

import { ErrorBanner } from "./ErrorBanner";

const renderBanner = (message: string): HTMLElement => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = String(ErrorBanner({ message }));
  return wrapper;
};

const meta: Meta<{ message: string }> = {
  title: "Fragments/ErrorBanner",
  render: ({ message }) => renderBanner(message),
};
export default meta;

type Story = StoryObj<typeof meta>;

export const SourceFailure = {
  args: { message: "2 source(s) failed to load — showing partial results." },
} as Story;

export const EscapesMarkup = {
  args: {
    message: "<script>alert(1)</script> should render as text, not execute",
  },
} as Story;
