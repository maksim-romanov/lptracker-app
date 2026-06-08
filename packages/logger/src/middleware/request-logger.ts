import { getLogger, withContext } from "@logtape/logtape";
import type { MiddlewareHandler } from "hono";

export interface RequestLoggerOptions {
  readonly app: string;
}

export function requestLogger({ app }: RequestLoggerOptions): MiddlewareHandler {
  const logger = getLogger([app, "http"]);
  return async (c, next) => {
    const requestId = crypto.randomUUID();
    const startedAt = performance.now();
    const method = c.req.method;
    const url = c.req.url;
    const userAgent = c.req.header("User-Agent") ?? null;

    await withContext({ requestId, method, url, userAgent }, async () => {
      logger.info("request started", { method, url, requestId });
      try {
        await next();
        const durationMs = Math.round(performance.now() - startedAt);
        if (c.error) {
          logger.error("request failed", { error: c.error, durationMs, requestId });
        } else {
          logger.info("request completed", { status: c.res.status, durationMs, requestId });
        }
      } catch (error) {
        const durationMs = Math.round(performance.now() - startedAt);
        logger.error("request failed", { error, durationMs, requestId });
        throw error;
      }
    });
  };
}
