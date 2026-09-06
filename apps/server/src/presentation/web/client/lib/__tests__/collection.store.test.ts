import { CollectionStore } from "../collection.store";
import type { IStorageAdapter } from "../storage.adapter";
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

class TestStore extends CollectionStore {
  value = "";

  constructor(key = "test-store") {
    super(key);
  }

  protected load(raw: string | null): void {
    this.value = this.parse<string>(raw, "");
  }

  protected dump(): string {
    return JSON.stringify(this.value);
  }

  set(value: string): void {
    this.value = value;
    this.persist();
  }
}

describe("CollectionStore", () => {
  it("hydrate reads by the store's own key and feeds the result to load()", async () => {
    const { kv, adapter } = fakeStorage();
    kv["test-store"] = JSON.stringify("hello");
    CollectionStore.useAdapter(adapter);

    const store = new TestStore();
    await store.hydrate();

    expect(store.value).toBe("hello");
  });

  it("hydrate never rejects even when the adapter's get() rejects, and falls back to load(null)", async () => {
    const rejectingAdapter: IStorageAdapter = {
      get: () => Promise.reject(new Error("boom")),
      set: () => Promise.resolve(),
    };
    CollectionStore.useAdapter(rejectingAdapter);

    const store = new TestStore();
    await expect(store.hydrate()).resolves.toBeUndefined();
    expect(store.value).toBe("");
  });

  it("hydrate never rejects even when the adapter's get() throws synchronously", async () => {
    const throwingAdapter: IStorageAdapter = {
      get: () => {
        throw new Error("boom");
      },
      set: () => Promise.resolve(),
    };
    CollectionStore.useAdapter(throwingAdapter);

    const store = new TestStore();
    await expect(store.hydrate()).resolves.toBeUndefined();
    expect(store.value).toBe("");
  });

  it("persist writes dump() under the store's key", () => {
    const { kv, adapter } = fakeStorage();
    CollectionStore.useAdapter(adapter);

    const store = new TestStore();
    store.set("value-a");

    expect(kv["test-store"]).toBe(JSON.stringify("value-a"));
  });

  it("persist swallows a rejected set() without throwing, and in-memory state stays authoritative", async () => {
    const failingAdapter: IStorageAdapter = {
      get: () => Promise.resolve(null),
      set: () => Promise.reject(new Error("storage full")),
    };
    CollectionStore.useAdapter(failingAdapter);

    const store = new TestStore();
    expect(() => store.set("value-b")).not.toThrow();
    expect(store.value).toBe("value-b");

    // Let the rejected set() promise settle — an unhandled rejection would surface here if persist() didn't catch it.
    await Promise.resolve();
  });

  it("parse (via hydrate) falls back for null and malformed JSON, and parses valid JSON", async () => {
    const { kv, adapter } = fakeStorage();
    CollectionStore.useAdapter(adapter);

    const nullCase = new TestStore("null-case");
    await nullCase.hydrate();
    expect(nullCase.value).toBe("");

    kv["malformed-case"] = "{not json";
    const malformedCase = new TestStore("malformed-case");
    await malformedCase.hydrate();
    expect(malformedCase.value).toBe("");

    kv["valid-case"] = JSON.stringify("valid");
    const validCase = new TestStore("valid-case");
    await validCase.hydrate();
    expect(validCase.value).toBe("valid");
  });

  it("useAdapter swaps the adapter used by subsequent hydrate/persist calls", () => {
    const first = fakeStorage();
    const second = fakeStorage();

    CollectionStore.useAdapter(first.adapter);
    const store = new TestStore();
    store.set("in-first");
    expect(first.kv["test-store"]).toBe(JSON.stringify("in-first"));
    expect(second.kv["test-store"]).toBeUndefined();

    CollectionStore.useAdapter(second.adapter);
    store.set("in-second");
    expect(second.kv["test-store"]).toBe(JSON.stringify("in-second"));
    expect(first.kv["test-store"]).toBe(JSON.stringify("in-first"));
  });
});
