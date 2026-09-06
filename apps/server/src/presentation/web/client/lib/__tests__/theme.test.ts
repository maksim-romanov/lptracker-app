import {
  applyTheme,
  currentTheme,
  DARK,
  LIGHT,
  prefersReducedMotion,
  resolveTheme,
  revealCircleFor,
  storeTheme,
  THEME_STORAGE_KEY,
} from "../theme";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";

const globals = globalThis as Record<string, unknown>;

let stored: Record<string, string>;
let media: Record<string, boolean>;

const stubStorage = (): void => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => stored[key] ?? null,
      setItem: (key: string, value: string) => {
        stored[key] = value;
      },
    },
  });
};

const stubBlockedStorage = (): void => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new Error("access denied");
    },
  });
};

beforeEach(() => {
  stored = {};
  media = {};
  stubStorage();
  globals.window = { matchMedia: (query: string) => ({ matches: media[query] ?? false }) };
  globals.document = { documentElement: { dataset: {} as Record<string, string> } };
});

afterEach(() => {
  Reflect.deleteProperty(globalThis, "localStorage");
  Reflect.deleteProperty(globals, "window");
  Reflect.deleteProperty(globals, "document");
});

describe("resolveTheme", () => {
  it("prefers a previously stored theme", () => {
    stored[THEME_STORAGE_KEY] = DARK;

    expect(resolveTheme()).toBe(DARK);
  });

  it("falls back to the OS preference when nothing is stored", () => {
    media["(prefers-color-scheme: dark)"] = true;

    expect(resolveTheme()).toBe(DARK);
  });

  it("defaults to light when nothing is stored and the OS prefers light", () => {
    expect(resolveTheme()).toBe(LIGHT);
  });

  it("ignores an unrecognized stored value", () => {
    stored[THEME_STORAGE_KEY] = "solarized";
    media["(prefers-color-scheme: dark)"] = true;

    expect(resolveTheme()).toBe(DARK);
  });

  it("still resolves when storage is blocked", () => {
    stubBlockedStorage();

    expect(resolveTheme()).toBe(LIGHT);
  });
});

describe("storeTheme", () => {
  it("persists the theme", () => {
    storeTheme(DARK);

    expect(stored[THEME_STORAGE_KEY]).toBe(DARK);
  });

  it("swallows a blocked write so the in-memory swap still applies", () => {
    stubBlockedStorage();

    storeTheme(DARK);
  });
});

describe("applyTheme / currentTheme", () => {
  it("writes data-theme onto the document element", () => {
    applyTheme(DARK);

    expect((globals.document as { documentElement: { dataset: Record<string, string> } }).documentElement.dataset.theme).toBe(DARK);
  });

  it("reads back the applied theme in preference to resolving it", () => {
    stored[THEME_STORAGE_KEY] = LIGHT;
    applyTheme(DARK);

    expect(currentTheme()).toBe(DARK);
  });

  it("resolves when no theme has been applied yet", () => {
    stored[THEME_STORAGE_KEY] = DARK;

    expect(currentTheme()).toBe(DARK);
  });
});

describe("prefersReducedMotion", () => {
  it("reflects the media query", () => {
    expect(prefersReducedMotion()).toBe(false);

    media["(prefers-reduced-motion: reduce)"] = true;

    expect(prefersReducedMotion()).toBe(true);
  });
});

describe("revealCircleFor", () => {
  const CHROME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
  const EDGE_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";
  const SAFARI_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15";
  const FIREFOX_UA = "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0";

  it("scales for Chromium at a high device pixel ratio", () => {
    expect(revealCircleFor(0, 0, 1000, 600, 2, CHROME_UA).scale).toBe(2);
  });

  it("scales for Edge, a Chromium-based browser, too", () => {
    expect(revealCircleFor(0, 0, 1000, 600, 2, EDGE_UA).scale).toBe(2);
  });

  it("does not scale Chromium at a 1x device pixel ratio", () => {
    expect(revealCircleFor(0, 0, 1000, 600, 1, CHROME_UA).scale).toBe(1);
  });

  it("does not scale a high-dpr Safari — the clip-path bug is Chromium-only", () => {
    expect(revealCircleFor(0, 0, 1000, 600, 2, SAFARI_UA).scale).toBe(1);
  });

  it("does not scale a high-dpr Firefox either", () => {
    expect(revealCircleFor(0, 0, 1000, 600, 3, FIREFOX_UA).scale).toBe(1);
  });

  it("picks the distance to the farthest corner from a point near the top-left", () => {
    expect(revealCircleFor(200, 50, 1000, 600, 1, "").endRadius).toBe(Math.hypot(800, 550));
  });

  it("picks the distance to the farthest corner from a point near the bottom-right", () => {
    expect(revealCircleFor(950, 580, 1000, 600, 1, "").endRadius).toBe(Math.hypot(950, 580));
  });
});
