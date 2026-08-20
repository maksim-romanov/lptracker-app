import { tokenAlias } from "../alias";
import { describe, expect, test } from "bun:test";

const paletteAlias = tokenAlias({
  color: { palette: { $type: "color", neonPink: { "500": { $value: "#FF007A" } } } },
});

describe("tokenAlias", () => {
  test("emits a DTCG reference for a valid path", () => {
    expect(paletteAlias("color.palette.neonPink.500")).toEqual({ $value: "{color.palette.neonPink.500}" });
  });

  test("throws when the path does not resolve to a token", () => {
    expect(() => paletteAlias("color.palette.neonPink.900" as never)).toThrow("does not resolve to a token");
  });
});
