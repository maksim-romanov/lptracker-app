import { CollectionStore } from "../lib/collection.store";
import { positionPrefs } from "../lib/position-prefs.store";
import { walletStore } from "../lib/wallet.store";
import { beforeEach, describe, expect, it } from "bun:test";

// Installed before module import so the top-level addEventListener call in
// htmx-params.ts fires against our fake (race-free guarantee).
let registered: { type: string; fn: (e: Event) => void } | null = null;
(globalThis as Record<string, unknown>).document = {
  addEventListener: (type: string, fn: (e: Event) => void) => {
    registered = { type, fn };
  },
};

const { inject } = await import("../htmx-params");

// Fake per-key storage; seed() writes the persisted form then rehydrates both stores.
let kv: Record<string, string> = {};
CollectionStore.useAdapter({
  get: (k: string) => Promise.resolve(kv[k] ?? null),
  set: (k: string, v: string) => {
    kv[k] = v;
    return Promise.resolve();
  },
});

const seed = async (next: { wallets?: string[]; inverted?: string[] }): Promise<void> => {
  kv = {};
  if (next.wallets) kv.wallets = JSON.stringify(next.wallets);
  if (next.inverted) kv.positionPrefs = JSON.stringify(Object.fromEntries(next.inverted.map((ref) => [ref, { inverted: true }])));
  await Promise.all([walletStore.hydrate(), positionPrefs.hydrate()]);
};

interface IFakeDetail {
  elt: { getAttribute: (n: string) => string | null };
  parameters: Record<string, string>;
}

const makeEvt = (attrs: Record<string, string>): { detail: IFakeDetail } => ({
  detail: {
    elt: { getAttribute: (n: string) => attrs[n] ?? null },
    parameters: {},
  },
});

describe("htmx-params", () => {
  beforeEach(async () => {
    await seed({});
  });

  describe("module-load registration", () => {
    // Registered at bundle-eval time: the listener exists before htmx's own
    // DOMContentLoaded init fires the first configRequest for the #board load.
    it("registers htmx:configRequest listener on document at module load (guarantee a)", () => {
      expect(registered?.type).toBe("htmx:configRequest");
    });
  });

  describe("inject()", () => {
    it("derives path from elt.getAttribute('hx-get'), not detail.path (guarantee b)", async () => {
      await seed({ wallets: ["0xabc:1"] });
      const evt = makeEvt({ "hx-get": "/app/positions" });
      inject(evt as unknown as Event);
      expect(evt.detail.parameters.wallets).toBe("0xabc:1");
    });

    it("injects wallets (pipe-joined) and inverted (comma-joined) for /app/positions (guarantee d)", async () => {
      await seed({ wallets: ["0xabc:1,8453", "0xdef:42161"], inverted: ["uniswap-v3:1:7"] });
      const evt = makeEvt({ "hx-get": "/app/positions" });
      inject(evt as unknown as Event);
      expect(evt.detail.parameters.wallets).toBe("0xabc:1,8453|0xdef:42161");
      expect(evt.detail.parameters.inverted).toBe("uniswap-v3:1:7");
    });

    it("sets inverted=1 and saves the ref on first invert-toggle (guarantee c)", async () => {
      await seed({ inverted: [] });
      const evt = makeEvt({ "hx-get": "/app/positions/uniswap-v3:1:42/card", "data-invert": "uniswap-v3:1:42" });
      inject(evt as unknown as Event);
      expect(evt.detail.parameters.inverted).toBe("1");
      expect(positionPrefs.serializeInverted()).toBe("uniswap-v3:1:42");
    });

    it("sets inverted=0 and removes the ref when toggling an already-inverted ref (guarantee c)", async () => {
      await seed({ inverted: ["uniswap-v3:1:42"] });
      const evt = makeEvt({ "hx-get": "/app/positions/uniswap-v3:1:42/card", "data-invert": "uniswap-v3:1:42" });
      inject(evt as unknown as Event);
      expect(evt.detail.parameters.inverted).toBe("0");
      expect(positionPrefs.serializeInverted()).toBe("");
    });

    it("does nothing for non-/app/positions paths (guarantee d)", async () => {
      await seed({ wallets: ["0xabc:1"] });
      const evt = makeEvt({ "hx-get": "/api/v1/positions" });
      inject(evt as unknown as Event);
      expect(evt.detail.parameters.wallets).toBeUndefined();
      expect(evt.detail.parameters.inverted).toBeUndefined();
    });
  });
});
