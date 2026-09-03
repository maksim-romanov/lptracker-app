import { raw } from "hono/html";
import type { PropsWithChildren } from "hono/jsx";

import { assets } from "../asset-manifest";
import { AppNav } from "./components/AppNav/AppNav";
import { AppShell } from "./components/AppShell/AppShell";
import { Button } from "./components/Button/Button";
import { Hero } from "./components/Hero/Hero";
import { Icon } from "./components/Icon/Icon";
import { Modal } from "./components/Modal/Modal/Modal";
import { Sidebar } from "./components/Modal/Sidebar/Sidebar";
import { Toast } from "./components/Toast/Toast";
import { PositionsLayoutToggle } from "./positions/PositionsLayoutToggle/PositionsLayoutToggle";
import { WalletChips } from "./wallets/WalletChips/WalletChips";
import { WalletConnect } from "./wallets/WalletConnect/WalletConnect";

const NavActions = () => (
  <>
    <Button
      data-wallet-target="connectButton"
      data-action="wallet#openSidebar"
      class="whitespace-nowrap rounded-full border-transparent bg-primary px-4 py-2 text-button text-on-primary"
    >
      Connect Wallet
    </Button>
    <Button
      hidden
      data-wallet-target="walletPill"
      data-action="wallet#disconnectWallet"
      aria-label="Disconnect wallet"
      class="flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-label"
    >
      <Icon name="wallet" size={16} />
      <span data-wallet-target="walletAddress" />
    </Button>
    <Button data-action="theme#toggle" data-theme-target="toggle" aria-label="Toggle dark mode" aria-pressed="false" class="rounded-full p-2">
      <Icon name="moon" size={18} />
      <Icon name="sun" size={18} />
    </Button>
  </>
);

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
        {/* The stylesheet only reveals which faces are needed once it has parsed; preloading
            the two that every screen uses keeps the first paint from swapping fonts. */}
        <link rel="preload" href="/static/fonts/IBMPlexSans-Regular-Latin1.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/static/fonts/IBMPlexMono-Regular-Latin1.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="stylesheet" href={assets.css} />
        <script src={assets.js} defer />
      </head>
      <body
        class="flex min-h-dvh flex-col bg-surface-dim text-on-surface"
        data-controller="wallet theme"
        data-wallet-dialog-outlet="#wallet-sidebar"
      >
        <main class="flex-1 p-4">
          {/* The shell is part of the page, so htmx swaps the board inside it and the nav,
              hero and section heading never re-render. */}
          <AppShell class="mx-auto max-w-[64rem]">
            <AppNav actions={<NavActions />} />

            <div class="shell-grid shell-content">
              <Hero title="Every position, every chain" description="Fees, balances and range across every wallet you track.">
                <WalletChips />
              </Hero>

              {/* The note qualifies the heading, so it sits with it. Pushed to the far edge it
                  read as a separate column of copy on a wide screen; the right side of this
                  row belongs to the list's own controls. */}
              <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 class="text-headline">Your positions</h2>
                  <p class="text-caption text-on-surface-variant">Amounts are per-token — Depthly doesn't total them in dollars.</p>
                </div>
                <PositionsLayoutToggle />
              </div>

              <div id="board-loader" class="htmx-indicator text-body-small text-on-surface-variant">
                Loading positions…
              </div>
              <div
                id="board"
                class="shell-grid shell-bleed"
                aria-live="polite"
                hx-get="/positions"
                hx-trigger="load, board:refresh from:body"
                hx-sync="this:replace"
                hx-indicator="#board-loader"
              >
                {children}
              </div>
            </div>
          </AppShell>
        </main>

        <footer class="px-4 pb-4 text-center text-caption text-on-surface-variant">Anonymous · positions stored in your browser</footer>

        <Sidebar id="wallet-sidebar">
          <WalletConnect />
        </Sidebar>

        <Toast id="position-toast-loading" type="loading">
          Loading position…
        </Toast>

        <Toast id="app-toast" type="error" indicator={false} data-controller="toast" data-action="depthly:toast@document->toast#show">
          <span data-toast-target="message" />
        </Toast>

        {/* The same panel in two chrome shells: docked to the edge where there is no room to
            centre it, centred where there is. `sidebar` carries the docked geometry the wallet
            panel also uses, so the two cannot drift apart. */}
        <Modal
          id="position-modal"
          class="sidebar sidebar-centered"
          title="Position details"
          action="htmx:afterSwap->dialog#open"
          bodyClass="flex max-h-[inherit] w-full flex-col gap-4 overflow-y-auto p-4"
        >
          <div id="position-modal-box" class="flex flex-col gap-3" />
        </Modal>
      </body>
    </html>
  </>
);
