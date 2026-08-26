import { raw } from "hono/html";
import type { PropsWithChildren } from "hono/jsx";

import { assets } from "../asset-manifest";
import { Button } from "./components/Button/Button";
import { Icon } from "./components/Icon/Icon";
import { Modal } from "./components/Modal/Modal/Modal";
import { Sidebar } from "./components/Modal/Sidebar/Sidebar";
import { WalletConnect } from "./wallets/WalletConnect/WalletConnect";

export const Layout = ({ children }: PropsWithChildren) => (
  <>
    {raw("<!DOCTYPE html>")}
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Depthly</title>
        <link rel="stylesheet" href={assets.css} />
        <script src={assets.js} defer />
      </head>
      <body class="flex min-h-screen flex-col bg-surface text-on-surface" data-controller="wallet">
        <header data-controller="theme" class="flex items-center justify-between gap-4 border-b border-outline p-4">
          <strong>Depthly</strong>
          <div class="flex items-center gap-2">
            <Button data-wallet-target="connectButton" data-action="wallet#openSidebar" class="px-3 py-2">
              Connect Wallet
            </Button>
            <Button
              hidden
              data-wallet-target="walletPill"
              data-action="wallet#disconnectWallet"
              aria-label="Disconnect wallet"
              class="flex items-center gap-2 px-3 py-2"
            >
              <Icon name="wallet" size={16} />
              <span data-wallet-target="walletAddress" />
            </Button>
            <Button data-action="theme#toggle" data-theme-target="toggle" aria-label="Toggle dark mode" aria-pressed="false" class="p-2">
              <Icon name="moon" size={18} />
              <Icon name="sun" size={18} />
            </Button>
          </div>
        </header>

        <main class="flex-1 p-4">
          <div class="@container flex flex-col gap-3 rounded-md border border-outline bg-surface-container p-4">
            <div id="board-loader" class="htmx-indicator">
              <span />
              Loading positions…
            </div>
            <div
              id="board"
              class="flex flex-col gap-3"
              hx-get="/positions"
              hx-trigger="load, board:refresh from:body"
              hx-sync="this:replace"
              hx-indicator="#board-loader"
            >
              {children}
            </div>
          </div>
        </main>

        <footer class="border-t border-outline p-4">Anonymous · positions stored in your browser</footer>

        <Sidebar id="wallet-sidebar" dataAttrs={{ "data-wallet-target": "sidebar" }}>
          <WalletConnect />
        </Sidebar>

        <Modal id="position-modal" controller="modal" bodyClass="flex w-full max-w-[640px] flex-col gap-4 p-4">
          <div id="position-modal-loading" class="htmx-indicator">
            <span />
            Loading position…
          </div>
          <div id="position-modal-box" data-modal-target="box" class="flex min-h-[24rem] flex-col gap-3" />
        </Modal>
      </body>
    </html>
  </>
);
