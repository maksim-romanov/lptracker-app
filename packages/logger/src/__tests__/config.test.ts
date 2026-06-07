import { readEnvConfig } from "../config";
import { describe, expect, test } from "bun:test";

describe("readEnvConfig", () => {
  test("defaults: empty env yields info level, dev mode, no appsignal", () => {
    const cfg = readEnvConfig({});
    expect(cfg.effectiveLevel).toBe("info");
    expect(cfg.isProd).toBe(false);
    expect(cfg.appsignalKey).toBeNull();
  });

  test("NODE_ENV=production toggles isProd", () => {
    const cfg = readEnvConfig({ NODE_ENV: "production" });
    expect(cfg.isProd).toBe(true);
  });

  test("LOG_LEVEL=warning sets effectiveLevel", () => {
    const cfg = readEnvConfig({ LOG_LEVEL: "warning" });
    expect(cfg.effectiveLevel).toBe("warning");
  });

  test("DEBUG=true forces debug, overriding LOG_LEVEL=error", () => {
    const cfg = readEnvConfig({ DEBUG: "true", LOG_LEVEL: "error" });
    expect(cfg.effectiveLevel).toBe("debug");
  });

  test("DEBUG=false does not override LOG_LEVEL", () => {
    const cfg = readEnvConfig({ DEBUG: "false", LOG_LEVEL: "error" });
    expect(cfg.effectiveLevel).toBe("error");
  });

  test("invalid LOG_LEVEL falls back to info", () => {
    const cfg = readEnvConfig({ LOG_LEVEL: "nonsense" });
    expect(cfg.effectiveLevel).toBe("info");
  });

  test("APPSIGNAL_PUSH_API_KEY present yields key", () => {
    const cfg = readEnvConfig({ APPSIGNAL_PUSH_API_KEY: "abc123" });
    expect(cfg.appsignalKey).toBe("abc123");
  });

  test("APPSIGNAL_PUSH_API_KEY absent yields null", () => {
    const cfg = readEnvConfig({});
    expect(cfg.appsignalKey).toBeNull();
  });
});
