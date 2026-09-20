import { toJsonSchema } from "@valibot/to-json-schema";
import * as v from "valibot";

import { buildPositionSchema, feeAccrualSchema, positionRangeSchema, positionStatSchema, yieldSourceSchema } from "../position.schema";
import { describe, expect, test } from "bun:test";

export const sampleExtension = v.pipe(
  v.object({ type: v.literal("sample-protocol"), version: v.number(), depth: v.number() }),
  v.metadata({ ref: "SampleExtension" }),
);

describe("buildPositionSchema", () => {
  test("emits oneOf, so Dart and Swift generators produce a sealed type rather than one flattened class", () => {
    const json = toJsonSchema(buildPositionSchema([sampleExtension]), { errorMode: "ignore" }) as Record<string, any>;

    expect(json.properties.extension.oneOf).toBeDefined();
    expect(json.properties.extension.anyOf).toBeUndefined();
  });

  test("emits no discriminator, which would compile the forward-compat fallback into a throw", () => {
    const json = toJsonSchema(buildPositionSchema([sampleExtension]), { errorMode: "ignore" }) as Record<string, any>;

    expect(json.properties.extension.discriminator).toBeUndefined();
  });

  test("keeps the unknown-extension fallback last, since variant resolution is try-each-in-order", () => {
    const json = toJsonSchema(buildPositionSchema([sampleExtension]), { errorMode: "ignore" }) as Record<string, any>;
    const variants = json.properties.extension.oneOf as Record<string, any>[];
    const last = variants[variants.length - 1];

    expect(last?.properties?.type?.const).toBeUndefined();
  });
});

describe("contract additions", () => {
  test("feeAccrual mode is an open string, so a new mode never breaks a shipped client", () => {
    expect(v.safeParse(feeAccrualSchema, { mode: "some-future-mode", reason: null, destination: null }).success).toBe(true);
  });

  test("feeAccrual carries a stable reason slug and, for redirected fees, where they went", () => {
    expect(v.safeParse(feeAccrualSchema, { mode: "redirected", reason: "gauge-staked", destination: "gauge-voters" }).success).toBe(true);
  });

  test("a yield source bundles several rewards under one claim", () => {
    const amount = { raw: "1000", decimals: 18, formatted: "0.000000000000001", tokenRef: "1:0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" };
    const result = v.safeParse(yieldSourceSchema, {
      kind: "gauge-emission",
      ref: "aerodrome-gauge:8453:0xgauge",
      container: { kind: "gauge", ref: "aerodrome:8453:0xgauge", label: "AERO gauge" },
      rewards: [{ tokenRef: "1:0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", claimable: amount, emissionPerSecond: null }],
    });
    expect(result.success).toBe(true);
  });

  test("a null range bound means unbounded, not missing", () => {
    const result = v.safeParse(positionRangeSchema, {
      lower: null,
      upper: "2200.5",
      current: "1950.4",
      baseTokenRef: "1:0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      quoteTokenRef: "1:0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    });
    expect(result.success).toBe(true);
  });

  test("a stat carries a critical flag, so a client that cannot interpret it still knows not to hide it", () => {
    expect(v.safeParse(positionStatSchema, { label: "Health factor", value: "1.04", critical: true }).success).toBe(true);
  });
});

// The positive cases above pass against v.any(). These are what tell these schemas apart from it.
describe("contract additions reject what they must", () => {
  test("feeAccrual keeps mode a string, so a producer cannot ship a mode a client reads as an object", () => {
    expect(v.safeParse(feeAccrualSchema, { mode: { slug: "claimable" }, reason: null, destination: null }).success).toBe(false);
  });

  test("feeAccrual requires reason and destination to be present, so a client never reads a missing key as null", () => {
    expect(v.safeParse(feeAccrualSchema, { mode: "claimable" }).success).toBe(false);
  });

  test("feeAccrual distinguishes an absent reason from an empty one: null, never undefined", () => {
    expect(v.safeParse(feeAccrualSchema, { mode: "claimable", reason: undefined, destination: null }).success).toBe(false);
  });

  test("a range bound is a string or null — a number would let a client lose precision on a parse it never made", () => {
    const range = {
      lower: 1800.5,
      upper: "2200.5",
      current: "1950.4",
      baseTokenRef: "1:0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      quoteTokenRef: "1:0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    };
    expect(v.safeParse(positionRangeSchema, range).success).toBe(false);
  });

  test("a range's current price is required, since a bar with no thumb is not a range", () => {
    const range = {
      lower: null,
      upper: null,
      baseTokenRef: "1:0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      quoteTokenRef: "1:0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    };
    expect(v.safeParse(positionRangeSchema, range).success).toBe(false);
  });

  test("a tokenRef carries a chain and a lowercase address, so two spellings of one token never split a balance", () => {
    const base = {
      lower: null,
      upper: null,
      current: "1950.4",
      quoteTokenRef: "1:0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    };
    const refuses = (baseTokenRef: string) => v.safeParse(positionRangeSchema, { ...base, baseTokenRef }).success;

    expect(refuses("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")).toBe(false);
    expect(refuses("1:0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")).toBe(false);
    expect(refuses("1:0xaaaa")).toBe(false);
    expect(refuses("mainnet:0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")).toBe(false);
  });

  test('a stat\'s critical flag is a boolean, so a client cannot read the string "false" as true', () => {
    expect(v.safeParse(positionStatSchema, { label: "Health factor", value: "1.04", critical: "false" }).success).toBe(false);
  });

  test("a yield reward names the token it pays in, so an amount is never orphaned from its unit", () => {
    const source = {
      kind: "gauge-emission",
      ref: "aerodrome-gauge:8453:0xgauge",
      container: null,
      rewards: [
        {
          claimable: { raw: "1", decimals: 18, formatted: "0.1", tokenRef: "1:0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
          emissionPerSecond: null,
        },
      ],
    };
    expect(v.safeParse(yieldSourceSchema, source).success).toBe(false);
  });
});
