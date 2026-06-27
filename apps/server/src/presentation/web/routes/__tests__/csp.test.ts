import app from "../../../../index";
import { describe, expect, it } from "bun:test";

describe("/app CSP", () => {
  it("sets an eval-free, inline-free script-src on /app", async () => {
    const res = await app.request("/app");
    const csp = res.headers.get("Content-Security-Policy") || "";
    expect(csp).toContain("script-src");
    expect(csp).toContain("'self'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toContain("unsafe-inline");
  });
});
