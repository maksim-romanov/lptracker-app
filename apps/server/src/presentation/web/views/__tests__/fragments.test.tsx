import type { ICardVM } from "../../../../features/uniswap-v3/presentation/web/position.web-mapper";
import { Empty } from "../fragments/Empty";
import { ErrorBanner } from "../fragments/ErrorBanner";
import { PositionCard } from "../fragments/PositionCard";
import { Positions } from "../fragments/Positions";
import { describe, expect, it, mock } from "bun:test";

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

describe("web fragments", () => {
  it("Empty renders an onboarding message for no-wallets", () => {
    expect(s(Empty({ reason: "no-wallets" }))).toContain("Add a wallet");
  });

  it("ErrorBanner escapes the message", () => {
    expect(s(ErrorBanner({ message: "<script>x</script>" }))).not.toContain("<script>x</script>");
  });

  it("PositionCard renders pair, fee tier, and an invert button carrying the ref", () => {
    const html = s(PositionCard({ card }));
    expect(html).toContain("WETH");
    expect(html).toContain("0.3%");
    expect(html).toContain('data-invert="uniswap-v3:1:42"');
    expect(html).toContain('hx-get="/app/positions/uniswap-v3:1:42/card"');
    // hx-target must be a valid selector: a colon-laden #id (the ref) breaks CSS querying,
    // so the swap silently fails. Target the enclosing card via `closest` instead.
    expect(html).toContain('hx-target="closest .position-card"');
    expect(html).not.toContain('hx-target="#card-');
    // own indicator overrides the inherited #board-loader so the per-card invert
    // swap does NOT trigger the full-board loader.
    expect(html).toContain('hx-indicator="this"');
  });

  it("Positions renders one card per position", () => {
    const html = s(Positions({ cards: [card] }));
    expect(html).toContain("uniswap-v3:1:42");
    expect(html).toContain("WETH");
  });

  it("Positions renders Empty when there are no cards", () => {
    expect(s(Positions({ cards: [] }))).toContain("No positions");
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
    expect(body).toContain("Add a wallet");
  });
});
