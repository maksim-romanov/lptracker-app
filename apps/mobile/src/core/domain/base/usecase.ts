import { container } from "core/di/container";
import { ALERTS, DEVICE_INFO, LOGGER } from "core/di/tokens";
import type { AlertsService, DeviceInfoService, Logger } from "core/services";

/**
 * Base UseCase class for application use cases
 *
 * Uses container.resolve() for common dependencies to simplify
 * child class constructors - they only need to inject their specific dependencies.
 *
 * @typeParam TOutput - Output type for the use case
 * @typeParam TInput - Input type for the use case
 *
 * @example
 * @injectable()
 * class LoginUseCase extends UseCase<LoginResult, LoginInput> {
 *   constructor(
 *     @inject(AUTH_REPOSITORY) private readonly authRepo: AuthRepository,
 *   ) {
 *     super();
 *   }
 *
 *   async execute(input: LoginInput): Promise<LoginResult> {
 *     this.logger.info("Attempting login", { email: input.email });
 *
 *     const result = await this.authRepo.login(input);
 *
 *     if (result.success) {
 *       this.alert.success("Welcome back!");
 *     } else {
 *       this.alert.error(result.error);
 *     }
 *
 *     return result;
 *   }
 * }
 */
export abstract class UseCase<TOutput = void, TInput = void> {
  protected readonly logger: Logger;
  protected readonly alert: AlertsService;
  protected readonly device: DeviceInfoService;

  constructor() {
    const baseLogger = container.resolve<Logger>(LOGGER);
    this.logger = baseLogger.extend(this.constructor.name);
    this.alert = container.resolve<AlertsService>(ALERTS);
    this.device = container.resolve<DeviceInfoService>(DEVICE_INFO);
  }

  abstract execute(input: TInput): Promise<TOutput>;
}
