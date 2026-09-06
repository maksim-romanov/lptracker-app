import * as v from "valibot";

import { DEFAULT_POSITIONS_LAYOUT, POSITIONS_LAYOUTS } from "../../positions-layout";
import { webPositionsQuerySchema } from "../query.schema";
import { describe, expect, it } from "bun:test";

const ADDR_A = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const ADDR_B = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

const parse = (input: Record<string, unknown>) => v.parse(webPositionsQuerySchema, input);
const rejects = (input: Record<string, unknown>) => v.safeParse(webPositionsQuerySchema, input).success === false;

describe("webPositionsQuerySchema — wallets", () => {
  it("parses a single wallet item with one chain id", () => {
    expect(parse({ wallets: `${ADDR_A}:1` }).wallets).toEqual([{ address: ADDR_A, chainIds: [1] }]);
  });

  it("parses multiple chain ids for one wallet", () => {
    expect(parse({ wallets: `${ADDR_A}:1,137` }).wallets).toEqual([{ address: ADDR_A, chainIds: [1, 137] }]);
  });

  it("parses multiple wallet items joined with |", () => {
    expect(parse({ wallets: `${ADDR_A}:1|${ADDR_B}:137` }).wallets).toEqual([
      { address: ADDR_A, chainIds: [1] },
      { address: ADDR_B, chainIds: [137] },
    ]);
  });

  it("lowercases a mixed-case address", () => {
    expect(parse({ wallets: `0x${ADDR_A.slice(2).toUpperCase()}:1` }).wallets).toEqual([{ address: ADDR_A, chainIds: [1] }]);
  });

  it("treats an empty string as no wallets", () => {
    expect(parse({ wallets: "" }).wallets).toEqual([]);
  });

  it("is undefined when omitted", () => {
    expect(parse({}).wallets).toBeUndefined();
  });

  it("rejects an item missing a chain id", () => {
    expect(rejects({ wallets: ADDR_A })).toBe(true);
  });

  it("rejects an address that is not 40 hex characters", () => {
    expect(rejects({ wallets: "0xabc:1" })).toBe(true);
  });

  it("rejects a non-numeric chain id", () => {
    expect(rejects({ wallets: `${ADDR_A}:abc` })).toBe(true);
  });
});

describe("webPositionsQuerySchema — protocols", () => {
  it("splits a comma-separated list", () => {
    expect(parse({ protocols: "uniswap-v3,uniswap-v4" }).protocols).toEqual(["uniswap-v3", "uniswap-v4"]);
  });

  it("filters empty segments", () => {
    expect(parse({ protocols: "uniswap-v3,,uniswap-v4" }).protocols).toEqual(["uniswap-v3", "uniswap-v4"]);
  });

  it("treats an empty string as an empty list", () => {
    expect(parse({ protocols: "" }).protocols).toEqual([]);
  });

  it("is undefined when omitted", () => {
    expect(parse({}).protocols).toBeUndefined();
  });
});

describe("webPositionsQuerySchema — status", () => {
  it("defaults to open when omitted", () => {
    expect(parse({}).status).toBe("open");
  });

  it("accepts closed", () => {
    expect(parse({ status: "closed" }).status).toBe("closed");
  });

  it("accepts all", () => {
    expect(parse({ status: "all" }).status).toBe("all");
  });

  it("rejects an arbitrary value", () => {
    expect(rejects({ status: "pending" })).toBe(true);
  });
});

describe("webPositionsQuerySchema — layout", () => {
  it("defaults to the configured default layout when omitted", () => {
    expect(parse({}).layout).toBe(DEFAULT_POSITIONS_LAYOUT);
  });

  it("accepts every declared layout", () => {
    for (const layout of POSITIONS_LAYOUTS) {
      expect(parse({ layout }).layout).toBe(layout);
    }
  });

  it("rejects a layout outside the declared set", () => {
    expect(rejects({ layout: "list" })).toBe(true);
  });
});

describe("webPositionsQuerySchema — inverted", () => {
  it("splits a comma-separated ref list into a Set", () => {
    expect(parse({ inverted: "ref-a,ref-b" }).inverted).toEqual(new Set(["ref-a", "ref-b"]));
  });

  it("treats an empty string as an empty Set", () => {
    expect(parse({ inverted: "" }).inverted).toEqual(new Set());
  });

  it("is undefined when omitted", () => {
    expect(parse({}).inverted).toBeUndefined();
  });
});
