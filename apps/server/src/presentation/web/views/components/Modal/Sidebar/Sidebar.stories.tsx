import type { Meta, StoryObj } from "@storybook/html-vite";

import { WalletConnect } from "../../../wallets/WalletConnect/WalletConnect";
import { Sidebar } from "./Sidebar";

const meta: Meta = {
  title: "Modal/Sidebar",
};
export default meta;

type Story = StoryObj<typeof meta>;

// `open` forces the native <dialog open> attribute so it renders inline in the canvas instead of
// its browser-default `display: none`.
export const Default = {
  render: () =>
    String(
      <Sidebar id="sidebar-story" open>
        <p>Sidebar content</p>
      </Sidebar>,
    ),
} as Story;

// Real composition, same as Layout.tsx: the chrome stays generic, the domain content
// (wallets/WalletConnect) is composed in as children.
export const WithWalletConnect = {
  render: () =>
    String(
      <Sidebar id="sidebar-wallet-story" open>
        <WalletConnect />
      </Sidebar>,
    ),
} as Story;
