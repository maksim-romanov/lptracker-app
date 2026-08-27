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

    // single-wallet connect flow, header-hosted (see wallet_controller.ts)
    expect(html).toContain('data-controller="wallet"');
    expect(html).toContain('data-wallet-target="connectButton"');
    expect(html).toContain('data-action="wallet#openSidebar"');
    expect(html).toContain('data-wallet-target="walletPill"');
    expect(html).toContain('data-action="wallet#disconnectWallet"');
    expect(html).toContain('data-wallet-target="walletAddress"');

    // sidebar: connect-wallet button + manual address fallback, both write
    // to the same single tracked slot; closes via native method="dialog" form
    // (shared Modal component) and via `:self` backdrop click on the dialog
    expect(html).toContain('id="wallet-sidebar"');
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

    // CSP-safe loading indicator on the positions board
    expect(html).toContain('id="board-loader"');
    expect(html).toContain("htmx-indicator");
    expect(html).toContain('hx-indicator="#board-loader"');

    // controller-driven error toast: opted out of htmx-indicator visibility
    expect(html).toContain('id="app-toast"');
    expect(html).toContain('data-controller="toast"');
    expect(html).toContain("depthly:toast@document-&gt;toast#show");
    expect(html).toContain('data-toast-target="message"');
  });
});
