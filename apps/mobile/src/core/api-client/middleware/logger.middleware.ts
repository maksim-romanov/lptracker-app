import { container } from "core/di/container";
import { LOGGER } from "core/di/tokens";
import type { Logger } from "core/services";
import type { Middleware } from "openapi-fetch";

export const loggerMiddleware = (): Middleware => {
  const logger = container.resolve<Logger>(LOGGER).extend("ApiClient");

  return {
    onRequest({ request }) {
      logger.debug(request.url);
    },
    onError({ error }) {
      logger.error(String(error));
    },
  };
};
