import { raw } from "hono/html";
import type { PropsWithChildren } from "hono/jsx";

import { assets } from "../asset-manifest";
import { IconCheck, IconClose, IconMoon, IconPlus, IconSun, IconWallet } from "./Icons";
import { NetworkLogo } from "./NetworkLogo";
import { NETWORKS } from "./networks";

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
      <body class="flex min-h-screen flex-col bg-surface text-on-surface">
        <header data-controller="theme" class="flex items-center justify-between gap-4 border-b border-outline p-4">
          <strong>Depthly</strong>
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
        </header>

        <main data-controller="wallet" class="grid flex-1 grid-cols-1 gap-6 p-4 md:grid-cols-[1fr_320px] md:items-start">
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

          <section class="flex flex-col gap-4 rounded-md border border-outline bg-surface-container p-4">
            <div class="flex flex-col gap-1">
              <h1>Track a wallet</h1>
              <p>Paste an address to monitor its Uniswap V3 positions across chains.</p>
            </div>

            <form data-action="submit->wallet#add" class="flex flex-col gap-3">
              <div class="flex gap-2">
                <label class="flex flex-1 items-center gap-2 rounded-sm border border-outline px-3 py-2">
                  <IconWallet size={18} />
                  <input
                    name="address"
                    data-wallet-target="address"
                    placeholder="0x… wallet address"
                    autocomplete="off"
                    spellcheck={false}
                    required
                    pattern="^0x[a-fA-F0-9]{40}$"
                    aria-label="Wallet address"
                    class="min-w-0 flex-1"
                  />
                </label>
                <button type="submit" aria-label="Add wallet" class="rounded-sm border border-outline p-2">
                  <IconPlus size={20} />
                </button>
              </div>
              <fieldset class="flex flex-col gap-2">
                <legend>Networks</legend>
                <div class="flex flex-wrap gap-2">
                  {NETWORKS.map((chain) => (
                    <label class="flex items-center gap-1 rounded-sm border border-outline px-2 py-1">
                      <input type="checkbox" name="chain" data-wallet-target="chain" value={String(chain.id)} checked />
                      <NetworkLogo chainId={chain.id} size={16} />
                      <span>{chain.label}</span>
                      <IconCheck size={14} />
                    </label>
                  ))}
                </div>
              </fieldset>
            </form>

            <div class="flex flex-col gap-2">
              <p>Tracked wallets</p>
              <div id="wallets" data-wallet-target="chips" class="flex flex-wrap gap-2" />
            </div>
            <template data-wallet-target="chipTemplate">
              <span class="flex items-center gap-1 rounded-sm border border-outline px-2 py-1">
                <IconWallet size={14} />
                <span data-chip-label />
                <button type="button" data-action="wallet#remove" aria-label="Remove wallet">
                  <IconClose size={14} />
                </button>
              </span>
            </template>
          </section>
        </main>

        <footer class="border-t border-outline p-4">Anonymous · positions stored in your browser</footer>

        <dialog id="position-modal" data-controller="modal" class="rounded-md border border-outline p-0">
          <div class="flex w-full max-w-[640px] flex-col gap-4 p-4">
            <form method="dialog" class="flex justify-end">
              <button type="submit" aria-label="Close" class="rounded-sm border border-outline p-2">
                <IconClose size={18} />
              </button>
            </form>
            <div id="position-modal-loading" class="htmx-indicator">
              <span />
            </div>
            <div id="position-modal-box" data-modal-target="box" class="flex flex-col gap-3" />
          </div>
          <form method="dialog">
            <button type="submit" aria-label="Close">
              close
            </button>
          </form>
        </dialog>
      </body>
    </html>
  </>
);
