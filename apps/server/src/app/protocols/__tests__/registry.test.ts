import "reflect-metadata";

import { protocolRegistry } from "../registry";
import { describe, expect, it } from "bun:test";
import { mapV3Error } from "#features/uniswap-v3/presentation/error-mapper";

describe("protocolRegistry", () => {
  it("registers uniswap-v3 with its own error hook", () => {
    const entry = protocolRegistry.bySlug("uniswap-v3");
    expect(entry).toBeDefined();
    expect(entry?.mapError).toBe(mapV3Error);
  });

  it("reports an unregistered slug as unknown rather than falling back to a neighbor", () => {
    expect(protocolRegistry.bySlug("not-a-real-protocol")).toBeUndefined();
  });
});
