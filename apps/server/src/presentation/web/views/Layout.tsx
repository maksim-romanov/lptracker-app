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
      <body class="bg-base-100 text-base-content">
        <header class="app-header" data-controller="theme">
          <div class="app-header__inner">
            <strong class="brand">Depthly</strong>
            <button
              type="button"
              data-action="theme#toggle"
              data-theme-target="toggle"
              class="btn btn-ghost btn-sm btn-square theme-toggle"
              aria-label="Toggle dark mode"
              aria-pressed="false"
            >
              <IconMoon size={18} class="theme-toggle__moon" />
              <IconSun size={18} class="theme-toggle__sun" />
            </button>
          </div>
        </header>

        <main class="app-main" data-controller="wallet">
          <section class="wallet-panel">
            <div class="wallet-panel__head">
              <h1 class="wallet-panel__title display">Track a wallet</h1>
              <p class="wallet-panel__sub">Paste an address to monitor its Uniswap V3 positions across chains.</p>
            </div>

            <form data-action="submit->wallet#add" class="wallet-form">
              <div class="wallet-form__row">
                <label class="input input-bordered wallet-input">
                  <IconWallet size={18} class="wallet-input__icon" />
                  <input
                    name="address"
                    data-wallet-target="address"
                    placeholder="0x… wallet address"
                    autocomplete="off"
                    spellcheck={false}
                    required
                    pattern="^0x[a-fA-F0-9]{40}$"
                    aria-label="Wallet address"
                  />
                </label>
                <button type="submit" class="btn btn-primary btn-circle wallet-form__submit" aria-label="Add wallet">
                  <IconPlus size={20} />
                </button>
              </div>
              <fieldset class="chains">
                <legend class="chains__legend">Networks</legend>
                <div class="chains__list">
                  {NETWORKS.map((chain) => (
                    <label class="chain">
                      <input type="checkbox" name="chain" data-wallet-target="chain" value={String(chain.id)} checked class="chain__input" />
                      <NetworkLogo chainId={chain.id} size={16} />
                      <span>{chain.label}</span>
                      <IconCheck size={14} class="chain__check" />
                    </label>
                  ))}
                </div>
              </fieldset>
            </form>

            <div class="tracked">
              <p class="tracked__label">Tracked wallets</p>
              <div id="wallets" class="wallet-chips" data-wallet-target="chips" />
            </div>
            <template data-wallet-target="chipTemplate">
              <span class="wallet-chip">
                <IconWallet size={14} class="wallet-chip__icon" />
                <span class="wallet-chip__addr" data-chip-label />
                <button type="button" data-action="wallet#remove" aria-label="Remove wallet" class="wallet-chip__remove">
                  <IconClose size={14} />
                </button>
              </span>
            </template>
          </section>

          <div class="board-region">
            <div id="board-loader" class="htmx-indicator board-loader">
              <span class="loading loading-spinner loading-sm" />
              Loading positions…
            </div>
            <div
              id="board"
              class="board"
              hx-get="/positions"
              hx-trigger="load, board:refresh from:body"
              hx-sync="this:replace"
              hx-indicator="#board-loader"
            >
              {children}
            </div>
          </div>
        </main>

        <footer class="app-footer">Anonymous · positions stored in your browser</footer>

        <dialog id="position-modal" class="modal position-modal" data-controller="modal">
          <div class="modal-box">
            <form method="dialog" class="close">
              <button type="submit" class="btn btn-sm btn-circle btn-ghost" aria-label="Close">
                <IconClose size={18} />
              </button>
            </form>
            <div id="position-modal-loading" class="loader htmx-indicator">
              <span class="loading loading-spinner loading-lg" />
            </div>
            <div id="position-modal-box" class="modal-detail" data-modal-target="box" />
          </div>
          <form method="dialog" class="modal-backdrop">
            <button type="submit" aria-label="Close">
              close
            </button>
          </form>
        </dialog>
      </body>
    </html>
  </>
);
