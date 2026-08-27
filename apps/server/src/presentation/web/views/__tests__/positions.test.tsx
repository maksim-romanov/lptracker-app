import { POSITIONS_LAYOUTS } from "../../positions-layout";
import { ErrorBanner } from "../components/Banner/ErrorBanner/ErrorBanner";
import { PositionInfoCard } from "../positions/PositionInfoCard/PositionInfoCard";
import { PositionInfoRow } from "../positions/PositionInfoRow/PositionInfoRow";
import { PositionItem } from "../positions/PositionItem/PositionItem";
import { Positions } from "../positions/Positions/Positions";
import { describe, expect, it, mock } from "bun:test";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

const card: ICardVM = {
  ref: "uniswap-v3:1:42",
  nftTokenId: "42",
  feeTierLabel: "0.3%",
  status: "in-range",
  inverted: false,
  chainId: 1,
  protocolLabel: "Uniswap V3",
  pair: { base: { tokenRef: "1:0xa", symbol: "WETH", iconUrl: "" }, quote: { tokenRef: "1:0xb", symbol: "USDC", iconUrl: "" } },
  principal: [{ tokenRef: "1:0xa", symbol: "WETH", formatted: "1.0", iconUrl: "" }],
  fees: [],
  priceRange: {
    minLabel: "1,800",
    currentLabel: "2,000",
    maxLabel: "2,200",
    quoteSymbol: "USDC",
    baseSymbol: "WETH",
    bandLeftPct: 15,
    bandWidthPct: 70,
    thumbPct: 50,
    inRange: true,
  },
  poolAddress: "0xpool",
};

const s = (node: unknown) => String(node);

describe("web positions", () => {
  it("ErrorBanner escapes the message", () => {
    expect(s(ErrorBanner({ message: "<script>x</script>" }))).not.toContain("<script>x</script>");
  });

  for (const [name, render] of [
    ["PositionInfoRow", () => s(PositionInfoRow({ card }))],
    ["PositionInfoCard", () => s(PositionInfoCard({ card }))],
  ] as const) {
    it(`${name} renders pair, fee tier, and an invert button carrying the ref`, () => {
      const html = render();
      expect(html).toContain("WETH");
      expect(html).toContain("0.3%");
      expect(html).toContain('data-invert="uniswap-v3:1:42"');
      expect(html).toContain('hx-get="/positions/uniswap-v3:1:42/item"');
      // hx-target must be a valid selector: a colon-laden #id (the ref) breaks CSS querying,
      // so the swap silently fails. `.position-item` is on both layouts' containers.
      expect(html).toContain('hx-target="closest .position-item"');
      expect(html).not.toContain('hx-target="#card-');
      // own indicator overrides the inherited #board-loader so the per-position invert
      // swap does NOT trigger the full-board loader.
      expect(html).toContain('hx-indicator="this"');
    });

    it(`${name} activates the whole item through a real button, not a clickable container`, () => {
      const html = render();
      // A tabindex'd container with a click handler announces every field as clickable;
      // the interaction belongs to a button that a pseudo-element stretches over the item.
      expect(html).not.toContain("tabindex");
      expect(html).not.toContain('data-controller="card"');
      expect(html).toContain("position-overlay");
      expect(html).toContain('aria-label="View WETH / USDC details"');
      expect(html).toContain('aria-haspopup="dialog"');
      expect(html).toContain('hx-get="/positions/uniswap-v3:1:42/detail?inverted=0"');
    });
  }

  it("PositionInfoRow is a table row of native elements, with no ARIA patching", () => {
    const html = s(PositionInfoRow({ card }));
    expect(html).toStartWith("<tr");
    expect(html).toContain('<th scope="row"');
    expect(html).toContain("<td");
    // Browsers keep table roles across display changes, so restating them as role=
    // would be redundant ARIA that also masks the a11y lint rules.
    expect(html).not.toContain("role=");
    // the column headers name every field, so the row must not repeat them
    expect(html).not.toContain("sr-only");
  });

  it("PositionInfoCard names its own fields through a description list", () => {
    const html = s(PositionInfoCard({ card }));
    expect(html).toStartWith("<li");
    // No header row here, so every field is a <dt>/<dd> pair. An adjacent sr-only
    // <span> would read the same aloud but carry no programmatic association.
    for (const label of ["Range", "Principal", "Status"]) {
      expect(html).toContain(`<dt class="sr-only">${label}</dt>`);
    }
    expect(html).not.toContain('<span class="sr-only">');
  });

  it("PositionItem hands back the markup that matches the requested layout", () => {
    expect(s(PositionItem({ card, layout: "table" }))).toStartWith("<tr");
    expect(s(PositionItem({ card, layout: "cards" }))).toStartWith("<li");
  });

  it("Positions renders a table with real column headers under the table layout", () => {
    const html = s(Positions({ cards: [card], layout: "table" }));
    expect(html).toContain("uniswap-v3:1:42");
    // the window frame is the table's border now; a wrapper of its own would double the
    // chrome and re-inset the cells the frame already insets
    expect(html).toStartWith("<table");
    expect(html).toContain("window-bleed");
    expect(html).toContain("<caption");
    expect(html).toContain('<th scope="col"');
    for (const column of ["Pool", "Range", "Principal", "Status"]) {
      expect(html).toContain(`>${column}</th>`);
    }
    // the old markup hid the header row from assistive tech and restated every column
    // as an sr-only label inside each item; real column headers replace both
    expect(html.match(/<thead[^>]*>/)?.[0]).not.toContain("aria-hidden");
  });

  it("Positions renders a labelled list under the cards layout", () => {
    const html = s(Positions({ cards: [card], layout: "cards" }));
    expect(html).toContain("uniswap-v3:1:42");
    expect(html).toStartWith("<ul");
    expect(html).toContain('aria-label="Uniswap v3 positions"');
    expect(html).not.toContain("<table");
  });

  it("Positions renders NoPositions when there are no cards, in either layout", () => {
    expect(s(Positions({ cards: [], layout: "table" }))).toContain("No positions");
    expect(s(Positions({ cards: [], layout: "cards" }))).toContain("No positions");
  });
});

// Route-level XSS regression — must be set up before importing routes.tsx.
mock.module("../../../../app/protocols/registry", () => ({
  protocolRegistry: { all: () => [], bySlug: () => undefined },
}));
mock.module("../../../../app/positions/list-positions", () => ({
  listPositions: async () => ({ positions: [], tokens: new Map(), partialFailures: [] }),
}));

const { webRoutes } = await import("../../routes/positions.routes");

describe("web route validation XSS regression", () => {
  it("escapes malicious status value in the validation error response", async () => {
    const payload = "<img src=x onerror=alert(1)>";
    const res = await webRoutes.request(`/positions?status=${encodeURIComponent(payload)}`);
    expect(res.status).toBe(400);
    const body = await res.text();
    expect(body).not.toContain(payload);
    expect(body).toContain("&lt;img");
  });

  it("returns Empty (200) when wallets are missing and protocol is also invalid", async () => {
    const res = await webRoutes.request("/positions?protocols=nonexistent");
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("Connect a wallet");
  });

  it("rejects a layout outside the two known presentations", async () => {
    expect((await webRoutes.request("/positions?layout=grid")).status).toBe(400);
    expect((await webRoutes.request("/positions/uniswap-v3:1:42/item?layout=grid")).status).toBe(400);
  });

  // Both endpoints build their schema from POSITIONS_LAYOUTS; this catches one of them
  // being narrowed by hand, which the type system cannot see. The item endpoint answers
  // 400 either way under these mocks, so the message is what separates "rejected by the
  // validator" from "got through and failed on the stubbed registry".
  it("accepts every declared layout on both endpoints", async () => {
    const rejected = await (await webRoutes.request("/positions/uniswap-v3:1:42/item?layout=grid")).text();
    expect(rejected).not.toContain("Unknown protocol");

    for (const layout of POSITIONS_LAYOUTS) {
      expect((await webRoutes.request(`/positions?layout=${layout}`)).status).toBe(200);
      const body = await (await webRoutes.request(`/positions/uniswap-v3:1:42/item?layout=${layout}`)).text();
      expect(body).toContain("Unknown protocol");
    }
  });
});
