import { raw } from "hono/html";
import type { PropsWithChildren } from "hono/jsx";

import { assets } from "../asset-manifest";
import { Button } from "./components/Button/Button";
import { Icon } from "./components/Icon/Icon";
import { Modal } from "./components/Modal/Modal/Modal";
import { Sidebar } from "./components/Modal/Sidebar/Sidebar";
import { Toast } from "./components/Toast/Toast";
import { WindowFrame } from "./components/WindowFrame/WindowFrame";
import { WalletConnect } from "./wallets/WalletConnect/WalletConnect";

export const Layout = ({ children }: PropsWithChildren) => (
  <>
    {raw("<!DOCTYPE html>")}
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Depthly</title>
        {/* Render-blocking on purpose: settles data-theme before the first paint so a
            dark-mode visitor never sees a flash of the light theme. Everything else
            boots from the deferred bundle below. */}
        <script src={assets.themeInit} />
        <link rel="stylesheet" href={assets.css} />
        <script src={assets.js} defer />
      </head>
      <body class="flex min-h-dvh flex-col bg-surface-dim text-on-surface" data-controller="wallet" data-wallet-dialog-outlet="#wallet-sidebar">
        <header data-controller="theme" class="flex items-center justify-between gap-4 border-outline border-b p-4">
          <h1 class="font-bold text-base">Depthly</h1>
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
          {/* The frame is part of the shell, so htmx swaps the board inside it and the
              chrome never re-renders. */}
          <WindowFrame title="Positions" class="mx-auto max-w-[64rem]">
            <div id="board-loader" class="htmx-indicator">
              Loading positions…
            </div>
            <div
              id="board"
              class="window-grid window-bleed"
              aria-live="polite"
              hx-get="/positions"
              hx-trigger="load, board:refresh from:body"
              hx-sync="this:replace"
              hx-indicator="#board-loader"
            >
              {children}
            </div>
          </WindowFrame>
        </main>

        <footer class="border-outline border-t p-4">Anonymous · positions stored in your browser</footer>

        <Sidebar id="wallet-sidebar">
          <WalletConnect />
        </Sidebar>

        <Toast id="position-toast-loading" type="loading">
          Loading position…
        </Toast>

        <Toast id="app-toast" type="error" indicator={false} data-controller="toast" data-action="depthly:toast@document->toast#show">
          <span data-toast-target="message" />
        </Toast>

        <Modal
          id="position-modal"
          title="Position details"
          action="htmx:afterSwap->dialog#open"
          bodyClass="flex w-full max-w-[640px] flex-col gap-4 p-4"
        >
          <div id="position-modal-box" class="flex flex-col gap-3" />
        </Modal>
      </body>
    </html>
  </>
);
