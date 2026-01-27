import { container } from "./container";

/**
 * Register all core dependencies
 */
function registerCoreDependencies(): void {
  // Core services will be registered here as the app grows
  // Example:
  // container.register(LOGGER_TOKEN, { useClass: LoggerService });
  // container.register(API_CLIENT_TOKEN, { useClass: ApiClient });
}

/**
 * Bootstrap the DI container with all dependencies
 */
function bootstrap(): void {
  registerCoreDependencies();

  // Feature modules will register themselves here
  // registerPositionsModule();
  // registerWalletsModule();
}

// Auto-bootstrap on import
bootstrap();

export { container };
