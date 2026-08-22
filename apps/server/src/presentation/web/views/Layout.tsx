import { raw } from "hono/html";
import type { PropsWithChildren } from "hono/jsx";

import { assets } from "../asset-manifest";
import { IconMoon, IconPlus, IconSun, IconWallet } from "./Icons";
import { Modal } from "./Modal";

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
            <button
              type="button"
              data-wallet-target="connectButton"
              data-action="wallet#openSidebar"
              class="rounded-sm border border-outline px-3 py-2"
            >
              Connect Wallet
            </button>
            <button
              type="button"
              hidden
              data-wallet-target="walletPill"
              data-action="wallet#disconnectWallet"
              aria-label="Disconnect wallet"
              class="flex items-center gap-2 rounded-sm border border-outline px-3 py-2"
            >
              <IconWallet size={16} />
              <span data-wallet-target="walletAddress" />
            </button>
            <button
              type="button"
              data-action="theme#toggle"
              data-theme-target="toggle"
              aria-label="Toggle dark mode"
              aria-pressed="false"
              class="rounded-sm border border-outline p-2"
            >
              <IconMoon size={18} />
              <IconSun size={18} />
            </button>
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

        <Modal id="wallet-sidebar" dataAttrs={{ "data-wallet-target": "sidebar" }} bodyClass="flex h-full w-full flex-col gap-4 p-4">
          <h2>Connect a wallet</h2>

          <button type="button" data-action="wallet#connectWallet" class="flex items-center gap-2 rounded-sm border border-outline p-3">
            <IconWallet size={18} />
            Connect Wallet
          </button>

          <div class="flex items-center gap-2 text-sm">
            <span class="h-px flex-1 bg-outline" />
            or
            <span class="h-px flex-1 bg-outline" />
          </div>

          <form data-action="submit->wallet#addManual" class="flex gap-2">
            <input
              name="address"
              data-wallet-target="addressInput"
              placeholder="0x… wallet address"
              autocomplete="off"
              spellcheck={false}
              required
              pattern="^0x[a-fA-F0-9]{40}$"
              aria-label="Wallet address"
              class="min-w-0 flex-1 rounded-sm border border-outline px-3 py-2"
            />
            <button type="submit" aria-label="Add address" class="rounded-sm border border-outline p-2">
              <IconPlus size={20} />
            </button>
          </form>
        </Modal>

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
