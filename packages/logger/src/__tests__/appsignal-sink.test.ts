import type { LogRecord } from "@logtape/logtape";

import { type AppsignalClient, createAppsignalSink } from "../sinks/appsignal";
import { describe, expect, test } from "bun:test";

function makeRecord(overrides: Partial<LogRecord> = {}): LogRecord {
  return {
    category: ["server", "v3", "repo"],
    level: "fatal",
    message: ["getWalletPositions failed"],
    rawMessage: "getWalletPositions failed",
    timestamp: 0,
    properties: {},
    ...overrides,
  } as LogRecord;
}

describe("createAppsignalSink", () => {
  test("forwards fatal record with error to sendError", () => {
    const captured: Array<Parameters<AppsignalClient["sendError"]>[0]> = [];
    const client: AppsignalClient = {
      sendError(payload) {
        captured.push(payload);
      },
    };
    const sink = createAppsignalSink(client);
    const err = new Error("boom");
    sink(makeRecord({ level: "fatal", properties: { error: err, chainId: 1 } }));
    expect(captured).toHaveLength(1);
    expect(captured[0]?.name).toBe("Error");
    expect(captured[0]?.message).toBe("boom");
    expect(captured[0]?.stack).toBe(err.stack);
    expect(captured[0]?.properties).toEqual({ chainId: 1 });
  });

  test("fatal without error property uses message and synthetic name", () => {
    const captured: Array<Parameters<AppsignalClient["sendError"]>[0]> = [];
    const client: AppsignalClient = {
      sendError(payload) {
        captured.push(payload);
      },
    };
    const sink = createAppsignalSink(client);
    sink(makeRecord({ level: "fatal", message: ["system shutdown"], properties: { reason: "oom" } }));
    expect(captured).toHaveLength(1);
    expect(captured[0]?.name).toBe("FatalLog");
    expect(captured[0]?.message).toBe("system shutdown");
    expect(captured[0]?.stack).toBeUndefined();
    expect(captured[0]?.properties).toEqual({ reason: "oom" });
  });

  test("non-fatal levels are ignored (defensive — also filtered upstream)", () => {
    const captured: Array<Parameters<AppsignalClient["sendError"]>[0]> = [];
    const client: AppsignalClient = {
      sendError(payload) {
        captured.push(payload);
      },
    };
    const sink = createAppsignalSink(client);
    sink(makeRecord({ level: "error" }));
    sink(makeRecord({ level: "warning" }));
    expect(captured).toHaveLength(0);
  });
});
