import { LOGGER } from "core/di/tokens";
import type { Logger } from "core/services";
import { container } from "tsyringe";

export abstract class Store {
  abstract hydrate(): Promise<void> | void;

  protected readonly logger = container.resolve<Logger>(LOGGER).extend(this.constructor.name);
}
