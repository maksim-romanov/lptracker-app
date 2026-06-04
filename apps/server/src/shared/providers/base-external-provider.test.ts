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

describe("BaseExternalProvider", () => {
  test("execute calls fetch and returns result", async () => {
    const p = new FakeProvider();
    expect(await p.execute(3)).toBe(6);
    expect(p.callCount).toBe(1);
  });

  test("circuit opens after threshold failures", async () => {
    const p = new FakeProvider();
    p.shouldThrow = true;
    await expect(p.execute(1)).rejects.toThrow();
    await expect(p.execute(1)).rejects.toThrow();
    await expect(p.execute(1)).rejects.toThrow();
    expect(p.callCount).toBeLessThanOrEqual(2);
  });
});
