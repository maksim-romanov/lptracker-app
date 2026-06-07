import { getLogger, type LogRecord, reset, type Sink } from "@logtape/logtape";
import { Hono } from "hono";

import { installLogger } from "../install";
import { requestLogger } from "../middleware/request-logger";
import { afterEach, describe, expect, test } from "bun:test";

afterEach(async () => {
  await reset();
});

function captureSink(records: LogRecord[]): Sink {
  return (record) => {
    records.push(record);
  };
}

async function bootApp(records: LogRecord[]) {
  await installLogger({
    app: "server",
    env: {},
    extraSinks: { capture: captureSink(records) },
    extraLoggers: [{ category: ["server"], sinks: ["capture"], lowestLevel: "debug" }],
  });
  const app = new Hono();
  app.use("*", requestLogger({ app: "server" }));
  return app;
}

describe("requestLogger", () => {
  test("emits start and complete records with requestId", async () => {
    const records: LogRecord[] = [];
    const app = await bootApp(records);
    app.get("/ok", (c) => c.json({ ok: true }));

    const res = await app.request("/ok");
    expect(res.status).toBe(200);

    const start = records.find((r) => r.message[0] === "request started");
    const complete = records.find((r) => r.message[0] === "request completed");
    expect(start).toBeDefined();
    expect(complete).toBeDefined();
    expect(start?.properties).toMatchObject({ method: "GET" });
    expect(complete?.properties).toMatchObject({ status: 200 });
    expect(typeof complete?.properties.durationMs).toBe("number");
    expect(typeof start?.properties.requestId).toBe("string");
    expect(start?.properties.requestId).toBe(complete?.properties.requestId);
  });

  test("nested getLogger calls inherit requestId via AsyncLocalStorage", async () => {
    const records: LogRecord[] = [];
    const app = await bootApp(records);
    app.get("/work", (c) => {
      getLogger(["server", "v3", "repo"]).info("doing work");
      return c.json({ ok: true });
    });

    await app.request("/work");

    const work = records.find((r) => r.message[0] === "doing work");
    const start = records.find((r) => r.message[0] === "request started");
    expect(work?.properties.requestId).toBeDefined();
    expect(work?.properties.requestId).toBe(start?.properties.requestId);
  });

  test("logs error and rethrows on handler throw", async () => {
    const records: LogRecord[] = [];
    const app = await bootApp(records);
    app.get("/boom", () => {
      throw new Error("boom");
    });
    app.onError((_err, c) => c.json({ error: "internal" }, 500));

    const res = await app.request("/boom");
    expect(res.status).toBe(500);

    const failed = records.find((r) => r.message[0] === "request failed");
    expect(failed).toBeDefined();
    expect(failed?.level).toBe("error");
    expect((failed?.properties as { error: Error }).error).toBeInstanceOf(Error);
  });
});
