import "reflect-metadata";

import { container } from "tsyringe";

import { LiFiLogo } from "./providers/lifi-logo.provider";
import { OneInchLogo } from "./providers/oneinch-logo.provider";
import { TrustWalletLogo } from "./providers/trustwallet-logo.provider";
import { TokenLogoResolver } from "./token-logo.resolver";
import { beforeEach, describe, expect, test } from "bun:test";

class TWStub extends TrustWalletLogo {
  public next: string | null = null;
  async resolve() {
    return this.next;
  }
}

class OIStub extends OneInchLogo {
  public next: string | null = null;
  async resolve() {
    return this.next;
  }
}

class LiFiStub extends LiFiLogo {
  public next: string | null = null;
  async resolve() {
    return this.next;
  }
}

let tw: TWStub;
let oi: OIStub;
let lifi: LiFiStub;

beforeEach(() => {
  container.clearInstances();
  tw = new TWStub();
  oi = new OIStub();
  lifi = new LiFiStub();
  container.register(TrustWalletLogo, { useValue: tw as unknown as TrustWalletLogo });
  container.register(OneInchLogo, { useValue: oi as unknown as OneInchLogo });
  container.register(LiFiLogo, { useValue: lifi as unknown as LiFiLogo });
});

describe("TokenLogoResolver", () => {
  test("first non-null wins", async () => {
    tw.next = "https://example.com/tw.png";
    oi.next = "https://example.com/oi.png";
    const r = container.resolve(TokenLogoResolver);
    expect(await r.resolve(1, "0x1")).toBe("https://example.com/tw.png");
  });

  test("falls through when first returns null", async () => {
    tw.next = null;
    oi.next = "https://example.com/oi.png";
    const r = container.resolve(TokenLogoResolver);
    expect(await r.resolve(1, "0x1")).toBe("https://example.com/oi.png");
  });

  test("falls through to LiFi when TrustWallet and OneInch return null", async () => {
    lifi.next = "https://cdn.li.quest/x.png";
    const r = container.resolve(TokenLogoResolver);
    expect(await r.resolve(1, "0x1")).toBe("https://cdn.li.quest/x.png");
  });

  test("returns null when all providers return null", async () => {
    const r = container.resolve(TokenLogoResolver);
    expect(await r.resolve(1, "0x1")).toBeNull();
  });
});
