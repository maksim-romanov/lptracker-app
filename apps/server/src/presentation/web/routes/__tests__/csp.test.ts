import app from "../../../../index";
import { describe, expect, it } from "bun:test";

describe("app shell CSP", () => {
  it("sets an eval-free, inline-free script-src on /", async () => {
    const res = await app.request("/");
    const csp = res.headers.get("Content-Security-Policy") || "";
    expect(csp).toContain("script-src");
    expect(csp).toContain("'self'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toContain("unsafe-inline");
  });
});
