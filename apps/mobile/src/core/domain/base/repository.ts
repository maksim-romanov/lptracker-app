import { container } from "core/di/container";
import { LOGGER } from "core/di/tokens";
import type { Logger } from "core/services";

export abstract class Repository {
  protected readonly logger = container.resolve<Logger>(LOGGER).extend(this.constructor.name);
}
