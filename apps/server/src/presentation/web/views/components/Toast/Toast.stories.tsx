import type { Meta, StoryObj } from "@storybook/html-vite";

import { Toast } from "./Toast";

const meta: Meta = {
  title: "Toast",
};
export default meta;

type Story = StoryObj<typeof meta>;

// Storybook never fires a real htmx request — force the resting `.htmx-indicator` (display:none,
// see app.css) into its `.htmx-request` state to preview how each type looks once shown.
const shown = (html: string) => html.replace('class="', 'class="htmx-request ');

export const Loading = {
  render: () =>
    shown(
      String(
        <Toast id="toast-loading" type="loading">
          Loading position…
        </Toast>,
      ),
    ),
} as Story;
export const Info = {
  render: () =>
    shown(
      String(
        <Toast id="toast-info" type="info">
          Prices may be a few minutes stale.
        </Toast>,
      ),
    ),
} as Story;
export const Warning = {
  render: () =>
    shown(
      String(
        <Toast id="toast-warning" type="warning">
          1 source(s) failed to load.
        </Toast>,
      ),
    ),
} as Story;
export const ErrorType = {
  render: () =>
    shown(
      String(
        <Toast id="toast-error" type="error">
          Could not load position.
        </Toast>,
      ),
    ),
} as Story;
