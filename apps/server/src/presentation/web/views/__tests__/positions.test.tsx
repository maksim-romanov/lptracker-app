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
  rangeTone: "in-range",
  inverted: false,
  chainId: 1,
  protocol: { slug: "uniswap-v3", label: "Uniswap V3" },
  pair: { base: { tokenRef: "1:0xa", symbol: "WETH", iconUrl: "" }, quote: { tokenRef: "1:0xb", symbol: "USDC", iconUrl: "" } },
  principal: [{ tokenRef: "1:0xa", symbol: "WETH", formatted: "5.165909", formattedShort: "5.1659", iconUrl: "" }],
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
  ownerAddress: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
  openedAtLabel: "Mar 12, 2026",
  hasUnclaimedFees: false,
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

  it("PositionInfoRow anchors the activation overlay to its first cell", () => {
    const html = s(PositionInfoRow({ card }));
    // A <tr> could not be the positioned ancestor until WebKit fixed it in 2026, and iOS
    // webviews track the OS — so the overlay hangs off a cell and is widened across the row.
    // It is the first cell now that the trailing actions column is gone.
    const firstCell = html.slice(html.indexOf("<th"), html.indexOf("</th>"));
    expect(firstCell).toContain("position-row-anchor");
    expect(firstCell).toContain("position-overlay");
  });

  it("PositionInfoRow is a table row of native elements, with no ARIA patching", () => {
    const html = s(PositionInfoRow({ card }));
    expect(html).toStartWith("<tr");
    expect(html).toContain('<th scope="row"');
    expect(html).toContain("<td");
    // Browsers keep table roles across display changes, so restating them as role=
    // would be redundant ARIA that also masks the a11y lint rules.
    for (const patched of ['role="row"', 'role="cell"', 'role="rowheader"', 'role="grid"', 'role="table"']) {
      expect(html).not.toContain(patched);
    }
  });

  it("PositionInfoRow shows the range as a bar named by visible text, not by colour alone", () => {
    const html = s(PositionInfoRow({ card }));
    expect(html).toContain('data-controller="range"');
    // colour is the only thing separating the bar's states, so the state is printed as a
    // word beside the pair for anyone who cannot tell the hues apart
    expect(html).toContain("In range");
    expect(html).not.toContain('<span class="sr-only">In range</span>');
    // bounds are anchored to the band's own ends, so the row answers "how far from which
    // edge" without opening the detail
    for (const numeric of ["1,800", "2,000", "2,200"]) {
      expect(html).toContain(numeric);
    }
    // three numbers pinned to percentages read as a bare list without one sentence naming
    // what they are
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Price range 1,800 to 2,200 USDC per WETH, current price 2,000. In range."');
  });

  it("PositionInfoRow names the bound a near-edge position is approaching", () => {
    const html = s(PositionInfoRow({ card: { ...card, rangeTone: "near-upper" } }));
    // which bound is being approached decides which way the position is rebalanced,
    // so the two near-edge tones must not collapse into one label
    expect(html).toContain("Near upper bound");
    expect(html).not.toContain("In range");
  });

  it("PositionInfoRow carries the network and both token amounts", () => {
    const html = s(PositionInfoRow({ card }));
    // the network lost its column to a badge on the icon cluster, which is an unnamed
    // mark on its own — the word has to survive somewhere in the accessibility tree
    expect(html).toContain("Ethereum");
    expect(html).not.toContain(">Ethereum<");
    // the list columns are one narrow slot per amount, so they take the width-bounded
    // rendering; the full-precision one belongs to the detail view
    expect(html).toContain("5.1659");
    expect(html).not.toContain("5.165909");
    // each amount names its own token on screen. They used to be bare numbers whose slots
    // the pair named a few columns to the left, with the symbol only in the a11y tree —
    // true, and a lot to ask of anyone reading down a column of them.
    expect(html).toContain("5.1659 WETH");
    expect(html).not.toContain('<span class="sr-only">WETH </span>');
    // fees are empty on this card, so the cell falls back to a dash that is not read aloud
    expect(html).toContain('<span class="sr-only">None</span>');

    const withFees = s(
      PositionInfoRow({
        card: { ...card, fees: [{ tokenRef: "1:0xb", symbol: "USDC", formatted: "8.40", formattedShort: "8.4", iconUrl: "" }] },
      }),
    );
    expect(withFees).toContain("8.4");
    expect(withFees).not.toContain('<span class="sr-only">None</span>');
  });

  it("PositionInfoCard names its amounts through real row and column headers", () => {
    const html = s(PositionInfoCard({ card }));
    expect(html).toStartWith("<li");
    // Each number is a token crossed with a measure, which a description list cannot
    // express — it names one value per term, and here every token has two.
    for (const column of ["Token", "Amount", "Unclaimed fees"]) {
      expect(html).toContain(`>${column}</th>`);
    }
    expect(html).toContain('<th scope="row"');
    // full precision here: the card has one wide slot per amount, unlike the table's columns
    expect(html).toContain("5.165909");
    // a field name announced from an adjacent span reads the same aloud but carries no
    // programmatic association, so it must come from the header cell and nowhere else
    expect(html).not.toContain('<span class="sr-only">Amount</span>');
  });

  it("PositionItem hands back the markup that matches the requested layout", () => {
    expect(s(PositionItem({ card, layout: "table" }))).toStartWith("<tr");
    expect(s(PositionItem({ card, layout: "cards" }))).toStartWith("<li");
  });

  it("Positions renders a table with real column headers under the table layout", () => {
    const html = s(Positions({ cards: [card], layout: "table" }));
    expect(html).toContain("uniswap-v3:1:42");
    // The shell is the table's border; the only wrapper is the scroller, which is focusable
    // and named because someone can now ask for the table on a viewport narrower than it
    // (WCAG 2.1.1) — and it borrows the caption rather than inventing a second name.
    expect(html).toStartWith("<section");
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('aria-labelledby="positions-table-caption"');
    expect(html).toContain("shell-bleed");
    expect(html).toContain('<caption id="positions-table-caption"');
    expect(html).toContain('<th scope="col"');
    for (const column of ["Position", "Range", "Amounts", "Unclaimed fees"]) {
      expect(html).toContain(`>${column}</th>`);
    }
    // the network moved into the Position cell as a badge; a column of its own repeated the
    // same word on nearly every row for a sixth of the table's width
    expect(html).not.toContain(">Network</th>");
    // and the invert button moved next to the pair it inverts, so there is no column left
    // holding a single icon
    expect(html).not.toContain(">Actions</span>");
    // the old markup hid the header row from assistive tech and restated every column
    // as an sr-only label inside each item; real column headers replace both
    expect(html.match(/<thead[^>]*>/)?.[0]).not.toContain("aria-hidden");
  });

  it("Positions renders a labelled list under the cards layout", () => {
    const html = s(Positions({ cards: [card], layout: "cards" }));
    expect(html).toContain("uniswap-v3:1:42");
    expect(html).toStartWith("<ul");
    expect(html).toContain('aria-label="Uniswap v3 positions"');
    // the board itself is a list here — the only table is the card's own amounts
    expect(html).not.toContain('<th scope="col" class="border-outline-variant');
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
    expect(body).toContain("Watch a wallet without connecting it");
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
