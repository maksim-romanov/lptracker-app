import { container } from "core/di/container";
import { LOGGER } from "core/di/tokens";
import type { Logger } from "core/services";

/**
 * Base Handler class for cross-cutting event subscriptions
 *
 * Uses container.resolve() for common dependencies to simplify
 * child class constructors.
 *
 * @example
 * @singleton()
 * class QueryAuthHandler extends Handler {
 *   constructor(
 *     @inject(AuthEvents) private readonly authEvents: AuthEvents,
 *     @inject(QUERY_CLIENT) private readonly queryClient: QueryClient
 *   ) {
 *     super();
 *     this.subscribe();
 *   }
 *
 *   private subscribe(): void {
 *     this.authEvents.events$.subscribe((event) => {
 *       if (event.type === "LOGGED_OUT") {
 *         this.queryClient.clear();
 *         this.logger.info("Query cache cleared on logout");
 *       }
 *     });
 *   }
 * }
 */
export abstract class Handler {
  protected readonly logger: Logger;

  constructor() {
    const baseLogger = container.resolve<Logger>(LOGGER);
    this.logger = baseLogger.extend(this.constructor.name);
  }
}
