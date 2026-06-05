import "reflect-metadata";

import { BaseExternalProvider, type ExternalProviderConfig } from "./base-external-provider";
import { describe, expect, test } from "bun:test";

class FakeProvider extends BaseExternalProvider<number, number> {
  readonly config: ExternalProviderConfig = {
    name: "fake",
    timeout: 1000,
    rateLimiter: { points: 5, duration: 1, execEvenly: false, execEvenlyMinDelayMs: 0 },
    circuitBreaker: { timeout: 1000, errorThresholdPercentage: 50, resetTimeout: 100, volumeThreshold: 2 },
  };

  callCount = 0;
  shouldThrow = false;

  protected async fetch(input: number): Promise<number> {
    this.callCount++;
    if (this.shouldThrow) throw new Error("upstream");
    return input * 2;
  }
}

class RateLimitedProvider extends BaseExternalProvider<number, number> {
  readonly config: ExternalProviderConfig = {
    name: "rate-limited",
    timeout: 1000,
    rateLimiter: { points: 2, duration: 60, execEvenly: false, execEvenlyMinDelayMs: 0 },
    // High volumeThreshold so rate-limit rejections don't open the breaker during the test.
    circuitBreaker: { timeout: 1000, errorThresholdPercentage: 50, resetTimeout: 100, volumeThreshold: 100 },
  };

  callCount = 0;

  protected async fetch(input: number): Promise<number> {
    this.callCount++;
    return input * 2;
  }
}

describe("BaseExternalProvider", () => {
  test("execute calls fetch and returns result", async () => {
    const p = new FakeProvider();
    expect(await p.execute(3)).toBe(6);
    expect(p.callCount).toBe(1);
  });

  test("circuit opens after threshold failures and isOpen flips", async () => {
    const p = new FakeProvider();
    p.shouldThrow = true;
    expect(p.isOpen).toBe(false);
    await expect(p.execute(1)).rejects.toThrow();
    await expect(p.execute(1)).rejects.toThrow();
    await expect(p.execute(1)).rejects.toThrow();
    expect(p.isOpen).toBe(true);
  });

  test("circuit closes after resetTimeout when fetch succeeds again", async () => {
    const p = new FakeProvider();
    p.shouldThrow = true;
    await expect(p.execute(1)).rejects.toThrow();
    await expect(p.execute(1)).rejects.toThrow();
    await expect(p.execute(1)).rejects.toThrow();
    expect(p.isOpen).toBe(true);

    // Wait past resetTimeout (100ms) to enter half-open state.
    await new Promise((r) => setTimeout(r, 150));

    p.shouldThrow = false;
    expect(await p.execute(1)).toBe(2);
    expect(p.isOpen).toBe(false);
  });

  test("rate limiter rejects after points exhausted without invoking fetch", async () => {
    const p = new RateLimitedProvider();
    expect(await p.execute(1)).toBe(2);
    expect(await p.execute(2)).toBe(4);
    await expect(p.execute(3)).rejects.toThrow();
    // fetch should NOT have been called the third time — the limiter rejected first.
    expect(p.callCount).toBe(2);
  });
});
