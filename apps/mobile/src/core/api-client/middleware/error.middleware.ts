import type { Middleware } from "openapi-fetch";

import { ApiError } from "../domain/api.error";

export const errorMiddleware = (): Middleware => ({
  async onResponse({ response, request }) {
    if (response.status >= 400) {
      const data = response.headers.get("content-type")?.includes("json") ? await response.clone().json() : await response.clone().text();

      throw new ApiError(response.statusText, {
        statusCode: response.status,
        endpoint: request.url,
        data,
      });
    }
  },
});
