import { container } from "core/di/container";
import { LOGGER } from "core/di/tokens";
import type { Logger } from "core/services";

/**
 * Base Repository class for data access
 *
 * Uses container.resolve() for common dependencies to simplify
 * child class constructors.
 *
 * @example
 * @injectable()
 * class UserRepository extends Repository {
 *   constructor(
 *     @inject(API_CLIENT) private readonly api: ApiClient,
 *   ) {
 *     super();
 *   }
 *
 *   async findById(id: string): Promise<User | null> {
 *     this.logger.debug("Finding user", { id });
 *     return this.api.get(`/users/${id}`);
 *   }
 * }
 */
export abstract class Repository {
  protected readonly logger: Logger;

  constructor() {
    const baseLogger = container.resolve<Logger>(LOGGER);
    this.logger = baseLogger.extend(this.constructor.name);
  }
}
