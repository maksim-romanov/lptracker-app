import { getLogger, type LogRecord, reset, type Sink, withContext } from "@logtape/logtape";

import { installLogger } from "../install";
import { afterEach, describe, expect, test } from "bun:test";

afterEach(async () => {
  await reset();
});

function captureSink(records: LogRecord[]): Sink {
  return (record) => {
    records.push(record);
  };
}

describe("installLogger", () => {
  test("logger under app category emits records", async () => {
    const records: LogRecord[] = [];
    await installLogger({
      app: "server",
      env: { LOG_LEVEL: "debug" },
      extraSinks: { capture: captureSink(records) },
      extraLoggers: [{ category: ["server"], sinks: ["capture"], lowestLevel: "debug" }],
    });
    getLogger(["server", "test"]).info("hello", { foo: 1 });
    expect(records.length).toBeGreaterThan(0);
    const hit = records.find((r) => r.message[0] === "hello");
    expect(hit).toBeDefined();
    expect(hit?.properties).toMatchObject({ foo: 1 });
  });

  test("LOG_LEVEL=error suppresses info records", async () => {
    const records: LogRecord[] = [];
    await installLogger({
      app: "server",
      env: { LOG_LEVEL: "error" },
      extraSinks: { capture: captureSink(records) },
      extraLoggers: [{ category: ["server"], sinks: ["capture"], lowestLevel: "error" }],
    });
    getLogger(["server", "test"]).info("ignored");
    getLogger(["server", "test"]).error("kept");
    const kept = records.find((r) => r.message[0] === "kept");
    const ignored = records.find((r) => r.message[0] === "ignored");
    expect(kept).toBeDefined();
    expect(ignored).toBeUndefined();
  });

  test("DEBUG=true forces debug even when LOG_LEVEL=error", async () => {
    const records: LogRecord[] = [];
    await installLogger({
      app: "server",
      env: { LOG_LEVEL: "error", DEBUG: "true" },
      extraSinks: { capture: captureSink(records) },
      extraLoggers: [{ category: ["server"], sinks: ["capture"], lowestLevel: "debug" }],
    });
    getLogger(["server", "test"]).debug("kept");
    const kept = records.find((r) => r.message[0] === "kept");
    expect(kept).toBeDefined();
  });

  test("AsyncLocalStorage context properties flow through getLogger calls", async () => {
    const records: LogRecord[] = [];
    await installLogger({
      app: "server",
      env: {},
      extraSinks: { capture: captureSink(records) },
      extraLoggers: [{ category: ["server"], sinks: ["capture"], lowestLevel: "info" }],
    });
    await withContext({ requestId: "rid-42" }, async () => {
      getLogger(["server", "v3"]).info("inside ctx");
    });
    const hit = records.find((r) => r.message[0] === "inside ctx");
    expect(hit?.properties).toMatchObject({ requestId: "rid-42" });
  });

  test("can be re-invoked without throwing (reset semantics)", async () => {
    await installLogger({ app: "server", env: {} });
    await installLogger({ app: "tokens-data", env: {} });
  });
});
