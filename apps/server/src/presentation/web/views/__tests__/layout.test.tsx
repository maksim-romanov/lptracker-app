import { Hono } from "hono";

import { Layout } from "../Layout";
import { describe, expect, it } from "bun:test";

describe("Layout", () => {
  it("renders shell with stylesheet, app script, wallet controller, add-form and #board", async () => {
    const app = new Hono();
    app.get("/", (c) => c.html(<Layout />));
    const res = await app.request("/");
    const html = await res.text();

    expect(html).toContain('rel="stylesheet"');
    expect(html).toContain('href="/static/dist/');
    expect(html).toContain('<script src="/static/dist/');

    expect(html).toContain('data-controller="wallet"');
    expect(html).toContain('data-action="submit-&gt;wallet#add"');
    expect(html).toContain('data-wallet-target="address"');
    expect(html).toContain('data-wallet-target="chain"');

    expect(html).toContain('id="board"');
    expect(html).toContain('hx-get="/positions"');
    expect(html).toContain("board:refresh");

    // chips render client-side from localStorage (no round-trip): a target container + a <template>
    expect(html).toContain('id="wallets"');
    expect(html).toContain('data-wallet-target="chips"');
    expect(html).toContain('data-wallet-target="chipTemplate"');
    expect(html).toContain("data-chip-label");
    expect(html).toContain('data-action="wallet#remove"');
    // CSP-safe loading indicator on the positions board
    expect(html).toContain('id="board-loader"');
    expect(html).toContain("htmx-indicator");
    expect(html).toContain('hx-indicator="#board-loader"');
  });
});
