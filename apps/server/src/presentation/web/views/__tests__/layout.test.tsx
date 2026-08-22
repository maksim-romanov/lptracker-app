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

    // single-wallet connect flow, header-hosted (see wallet_controller.ts)
    expect(html).toContain('data-controller="wallet"');
    expect(html).toContain('data-wallet-target="connectButton"');
    expect(html).toContain('data-action="wallet#openSidebar"');
    expect(html).toContain('data-wallet-target="walletPill"');
    expect(html).toContain('data-action="wallet#disconnectWallet"');
    expect(html).toContain('data-wallet-target="walletAddress"');

    // sidebar: connect-wallet button + manual address fallback, both write
    // to the same single tracked slot; closes via native method="dialog"
    // form (shared Modal component) and via click-outside on the backdrop
    expect(html).toContain('id="wallet-sidebar"');
    expect(html).toContain('data-wallet-target="sidebar"');
    expect(html).toContain('data-controller="click-outside"');
    expect(html).toContain('data-action="wallet#connectWallet"');
    expect(html).toContain('data-action="submit-&gt;wallet#addManual"');
    expect(html).toContain('data-wallet-target="addressInput"');

    // position detail modal: shares the Modal component, adds its own
    // `modal` controller alongside the generic click-outside one
    expect(html).toContain('id="position-modal"');
    expect(html).toContain('data-controller="click-outside modal"');
    expect(html).toContain('id="position-modal-box"');

    expect(html).toContain('id="board"');
    expect(html).toContain('hx-get="/positions"');
    expect(html).toContain("board:refresh");

    // CSP-safe loading indicator on the positions board
    expect(html).toContain('id="board-loader"');
    expect(html).toContain("htmx-indicator");
    expect(html).toContain('hx-indicator="#board-loader"');
  });
});
