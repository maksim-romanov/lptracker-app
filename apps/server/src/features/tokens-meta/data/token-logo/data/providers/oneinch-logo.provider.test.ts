import "reflect-metadata";

import { OneInchLogo } from "./oneinch-logo.provider";
import { describe, expect, test } from "bun:test";

class Testable extends OneInchLogo {
  public nextStatus = 200;
  protected async head(_url: string): Promise<Response> {
    return new Response(null, { status: this.nextStatus });
  }
}

describe("OneInchLogo", () => {
  test("returns lowercased URL when HEAD ok", async () => {
    const p = new Testable();
    expect(await p.resolve(1, "0xAbCdEf")).toBe("https://tokens.1inch.io/0xabcdef.png");
  });

  test("returns null when HEAD returns 404", async () => {
    const p = new Testable();
    p.nextStatus = 404;
    expect(await p.resolve(1, "0xAbCdEf")).toBeNull();
  });
});
