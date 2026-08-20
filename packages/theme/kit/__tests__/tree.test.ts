import { resolveTree } from "../tree";
import { describe, expect, test } from "bun:test";

describe("resolveTree", () => {
  test("unwraps $value leaves and drops $-prefixed metadata", () => {
    const tree = resolveTree({
      color: { $type: "color", primary: { $value: "#FF007A" } },
      spacing: { sm: { $value: 8 } },
    });
    expect(tree).toEqual({ color: { primary: "#FF007A" }, spacing: { sm: 8 } });
  });

  test("throws on non-token nodes", () => {
    expect(() => resolveTree(null)).toThrow("Unexpected token node");
  });
});
