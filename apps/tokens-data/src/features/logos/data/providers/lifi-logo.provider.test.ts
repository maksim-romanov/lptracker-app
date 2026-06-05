import "reflect-metadata";

import { LiFiLogo } from "./lifi-logo.provider";
import { describe, expect, test } from "bun:test";

class Testable extends LiFiLogo {
  public nextStatus = 200;
  public nextBody: unknown = { logoURI: "https://cdn.li.quest/example.png" };

  protected async fetchToken(_url: string): Promise<Response> {
    return new Response(JSON.stringify(this.nextBody), {
      status: this.nextStatus,
      headers: { "content-type": "application/json" },
    });
  }
}

describe("LiFiLogo", () => {
  test("returns logoURI when API responds ok with payload", async () => {
    const p = new Testable();
    expect(await p.resolve(1, "0xAbC")).toBe("https://cdn.li.quest/example.png");
  });

  test("returns null when API responds non-ok", async () => {
    const p = new Testable();
    p.nextStatus = 404;
    expect(await p.resolve(1, "0xAbC")).toBeNull();
  });

  test("returns null when payload has no logoURI", async () => {
    const p = new Testable();
    p.nextBody = {};
    expect(await p.resolve(1, "0xAbC")).toBeNull();
  });
});
