import "reflect-metadata";

import { TrustWalletLogo } from "./trustwallet-logo.provider";
import { describe, expect, test } from "bun:test";

class Testable extends TrustWalletLogo {
  public nextStatus = 200;
  protected async head(_url: string): Promise<Response> {
    return new Response(null, { status: this.nextStatus });
  }
}

describe("TrustWalletLogo", () => {
  test("returns URL for supported chain when HEAD ok", async () => {
    const p = new Testable();
    const url = await p.resolve(1, "0x0000000000000000000000000000000000000001");
    expect(url).toContain("trustwallet.com");
    expect(url).toContain("/ethereum/");
  });

  test("returns null for unsupported chain", async () => {
    const p = new Testable();
    expect(await p.resolve(9999, "0x0000000000000000000000000000000000000001")).toBeNull();
  });

  test("returns null when HEAD returns 404", async () => {
    const p = new Testable();
    p.nextStatus = 404;
    expect(await p.resolve(1, "0x0000000000000000000000000000000000000001")).toBeNull();
  });
});
