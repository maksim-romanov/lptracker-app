export type { Logger, LogRecord, Sink } from "@logtape/logtape";
export { getLogger, withContext } from "@logtape/logtape";

export type { InstallLoggerOptions } from "./install";
export { installLogger } from "./install";
export type { RequestLoggerOptions } from "./middleware/request-logger";
export { requestLogger } from "./middleware/request-logger";
export type { AppsignalClient, AppsignalErrorPayload } from "./sinks/appsignal";
export { createAppsignalSink } from "./sinks/appsignal";
export { consoleSink } from "./sinks/console";
