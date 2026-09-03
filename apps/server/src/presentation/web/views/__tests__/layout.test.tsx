import { Hono } from "hono";

import { Layout } from "../Layout";
import { describe, expect, it } from "bun:test";

describe("Layout", () => {
  it("renders shell with stylesheet, app script, wallet connect controls and #board", async () => {
    const app = new Hono();
    app.get("/", (c) => c.html(<Layout />));
    const res = await app.request("/");
    const html = await res.text();

    expect(html).toContain('rel="stylesheet"');
    expect(html).toContain('href="/static/dist/');
    expect(html).toContain('<script src="/static/dist/');

    // theme-init is render-blocking — the absence of `defer` before `>` is the point,
    // since that is what settles data-theme before the first paint
    expect(html).toMatch(/<script src="\/static\/dist\/theme-init[^"]*\.js"><\/script>/);

    // single-wallet connect flow, nav-hosted (see wallet_controller.ts)
    expect(html).toContain('data-controller="wallet theme tooltip"');
    expect(html).toContain('data-wallet-target="connectButton"');
    expect(html).toContain('data-action="wallet#openSidebar"');
    expect(html).toContain('data-wallet-target="walletPill"');
    expect(html).toContain('data-action="wallet#disconnectWallet"');
    expect(html).toContain('data-wallet-target="walletAddress"');

    // sidebar: connect-wallet button + manual address fallback, both write
    // to the same single tracked slot; closes via native method="dialog" form
    // (shared Modal component) and via `:self` backdrop click on the dialog
    expect(html).toContain('id="wallet-sidebar"');
    // titled through the shared Modal chrome, so the name and the close button share a row
    expect(html).toContain('id="wallet-sidebar-title"');
    expect(html).toContain('data-controller="dialog"');
    expect(html).toContain("click-&gt;dialog#close:self");
    expect(html).toContain('data-action="wallet#connectWallet"');
    expect(html).toContain('data-action="submit-&gt;wallet#addManual"');
    expect(html).toContain('data-wallet-target="addressInput"');

    // wallet reaches the sidebar through a Stimulus outlet, not a target
    expect(html).toContain('data-wallet-dialog-outlet="#wallet-sidebar"');

    // position detail modal: shares the Modal component; htmx:afterSwap bubbles
    // from the box up to the dialog, so no document-level listener is needed
    expect(html).toContain('id="position-modal"');
    expect(html).toContain("htmx:afterSwap-&gt;dialog#open");
    expect(html).toContain('id="position-modal-box"');

    expect(html).toContain('id="board"');
    expect(html).toContain('hx-get="/positions"');
    expect(html).toContain("board:refresh");

    // The board reports progress through a toast, not through copy standing where the table
    // is about to be — htmx swaps only once the response is in hand, so nothing is cleared
    // while it loads.
    expect(html).toContain('id="board-loader"');
    expect(html).toContain("htmx-indicator");
    expect(html).toContain('hx-indicator="#board-loader"');
    expect(html).toContain("toast-spinner");
    const loader = html.slice(html.indexOf('id="board-loader"'));
    expect(loader.slice(0, 400)).toContain("Loading positions");
    // it lives with the other toasts, after the board, not inside the shell grid
    expect(html.indexOf('id="board"')).toBeLessThan(html.indexOf('id="board-loader"'));

    // controller-driven error toast: opted out of htmx-indicator visibility
    expect(html).toContain('id="app-toast"');
    expect(html).toContain('data-controller="toast"');
    expect(html).toContain("depthly:toast@document-&gt;toast#show");
    expect(html).toContain('data-toast-target="message"');

    // one page-wide tooltip bubble, driven by delegated hover/focus on <body> so htmx can
    // replace the board without rebinding anything
    expect(html).toContain('id="app-tooltip"');
    expect(html).toContain('popover="manual"');
    expect(html).toContain('data-tooltip-target="bubble"');
    expect(html).toContain("mouseover-&gt;tooltip#show");
    expect(html).toContain("keydown-&gt;tooltip#dismiss");
  });

  it("hosts the board inside the app shell", async () => {
    const app = new Hono();
    app.get("/", (c) => c.html(<Layout />));
    const res = await app.request("/");
    const html = await res.text();

    // One screen, so no section nav: "Positions" would have pointed at this page and "Wallets"
    // at a panel two controls on this page already open.
    expect(html).not.toContain("<nav");

    // The document outline starts at the screen's own subject, not at the product name —
    // the wordmark beside the mark is a label, not a heading.
    expect(html).toContain('<h1 class="text-title">Every position, every chain</h1>');
    expect(html).toContain(">Your positions</h2>");

    // Wallet chips are a client-filled list: the server ships the container and the one
    // control that is always there, and never learns a wallet's nickname.
    expect(html).toContain('data-wallet-target="chips"');
    expect(html).toContain('data-wallet-target="chipsEnd"');

    // The board is swapped inside the shell, so the nav and hero never re-render.
    expect(html.indexOf("shell-content")).toBeLessThan(html.indexOf('id="board"'));
  });
});
