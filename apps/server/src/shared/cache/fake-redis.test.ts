import { FakeRedis } from "./fake-redis";
import { describe, expect, test } from "bun:test";

describe("FakeRedis", () => {
  test("get returns null for missing key", async () => {
    const r = new FakeRedis();
    expect(await r.get("missing")).toBeNull();
  });

  test("set then get returns the value", async () => {
    const r = new FakeRedis();
    await r.set("a", "1");
    expect(await r.get("a")).toBe("1");
  });

  test("expire causes the key to be missing after advance", async () => {
    const r = new FakeRedis();
    await r.set("a", "1");
    await r.expire("a", 10);
    r.advance(11_000);
    expect(await r.get("a")).toBeNull();
  });

  test("del removes the key", async () => {
    const r = new FakeRedis();
    await r.set("a", "1");
    await r.del("a");
    expect(await r.get("a")).toBeNull();
  });
});
