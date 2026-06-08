import type { LogRecord, Sink } from "@logtape/logtape";

export interface AppsignalErrorPayload {
  readonly name: string;
  readonly message: string;
  readonly stack?: string;
  readonly properties?: Record<string, unknown>;
}

export interface AppsignalClient {
  sendError(payload: AppsignalErrorPayload): void | Promise<void>;
}

function composeMessage(parts: readonly unknown[]): string {
  let result = "";
  for (const part of parts) {
    result += typeof part === "string" ? part : JSON.stringify(part);
  }
  return result;
}

export function createAppsignalSink(client: AppsignalClient): Sink {
  return (record: LogRecord) => {
    if (record.level !== "fatal") return;
    const { error, ...rest } = record.properties as { error?: unknown } & Record<string, unknown>;
    const message = composeMessage(record.message);
    if (error instanceof Error) {
      void client.sendError({
        name: error.name,
        message: error.message,
        stack: error.stack,
        properties: rest,
      });
      return;
    }
    void client.sendError({
      name: "FatalLog",
      message,
      properties: rest,
    });
  };
}
