import { constExport, objectType, stringUnion, tsFile, tsLiteral, typeAlias } from "../ts-emit";
import { describe, expect, test } from "bun:test";

describe("ts-emit", () => {
  test("tsLiteral quotes non-identifier keys and keeps numbers raw", () => {
    expect(tsLiteral({ "2xl": 24, none: 0 })).toBe('{\n  "2xl": 24,\n  none: 0,\n}');
  });

  test("tsLiteral inlines nested objects from the requested depth", () => {
    expect(tsLiteral({ ethereum: { base: "#627EEA" } }, 0, 1)).toBe('{\n  ethereum: { base: "#627EEA" },\n}');
  });

  test("constExport supports type annotations and as const", () => {
    expect(constExport("palette", { white: "#FFFFFF" }, { asConst: true })).toBe('export const palette = {\n  white: "#FFFFFF",\n} as const;');
    expect(constExport("theme", { primary: "#FF007A" }, { type: "ColorTokens" })).toBe(
      'export const theme: ColorTokens = {\n  primary: "#FF007A",\n};',
    );
  });

  test("typeAlias, stringUnion and objectType compose type declarations", () => {
    expect(typeAlias("FontWeight", stringUnion(["400", "700"]))).toBe('export type FontWeight = "400" | "700";');
    expect(typeAlias("NetworkColor", objectType([["base", "string"]]))).toBe("export type NetworkColor = {\n  base: string;\n};");
  });

  test("tsFile joins statements with blank lines and ends with a newline", () => {
    expect(tsFile("// header", ["a;", "b;"])).toBe("// header\n\na;\n\nb;\n");
  });
});
