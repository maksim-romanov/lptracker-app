import { LOGGER } from "core/di/tokens";
import type { Logger } from "core/services";
import { container } from "tsyringe";

/**
 * Store interface for state management with hydration support
 *
 * @example
 * class AuthStore implements Store {
 *   async hydrate(): Promise<void> {
 *     const token = await secureStorage.get("auth_token");
 *     if (token) {
 *       this.setToken(token);
 *     }
 *   }
 * }
 */
export abstract class Store {
  /** Hydrate store from persistent storage */
  abstract hydrate(): Promise<void> | void;

  protected readonly logger = container.resolve<Logger>(LOGGER).extend(this.constructor.name);
}
