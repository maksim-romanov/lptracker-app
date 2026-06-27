import { CollectionStore } from "../collection.store";
import { positionPrefs } from "../position-prefs.store";
import { describe, expect, it } from "bun:test";

const fakeStorage = () => {
  const kv: Record<string, string> = {};
  return {
    kv,
    adapter: {
      get: (k: string) => Promise.resolve(kv[k] ?? null),
      set: (k: string, v: string) => {
        kv[k] = v;
        return Promise.resolve();
      },
    },
  };
};

describe("PositionPrefsStore", () => {
  it("toggleInverted flips, persists per-ref flags, and prunes when no flag remains", async () => {
    const { kv, adapter } = fakeStorage();
    CollectionStore.useAdapter(adapter);
    await positionPrefs.hydrate();

    expect(positionPrefs.toggleInverted("r1")).toBe(true);
    expect(positionPrefs.serializeInverted()).toBe("r1");
    expect(JSON.parse(kv.positionPrefs ?? "{}")).toEqual({ r1: { inverted: true } });

    expect(positionPrefs.toggleInverted("r1")).toBe(false);
    expect(positionPrefs.serializeInverted()).toBe("");
    expect(JSON.parse(kv.positionPrefs ?? "{}")).toEqual({}); // pruned
  });

  it("serializeInverted lists only inverted refs, comma-joined", async () => {
    const { kv, adapter } = fakeStorage();
    kv.positionPrefs = JSON.stringify({ a: { inverted: true }, b: { inverted: false }, c: { inverted: true } });
    CollectionStore.useAdapter(adapter);
    await positionPrefs.hydrate();

    expect(positionPrefs.serializeInverted()).toBe("a,c");
  });
});
