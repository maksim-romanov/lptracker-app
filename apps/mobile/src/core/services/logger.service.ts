import { consoleTransport, logger, type transportFunctionType } from "react-native-logs";

/** Metadata for structured logging */
export interface LogMetadata {
  [key: string]: unknown;
}

/** Log levels by severity */
export type LogLevel = "debug" | "info" | "warn" | "error" | "critical";

/**
 * Logger interface with structured logging support
 *
 * @example
 * // Simple message
 * logger.info("User logged in");
 *
 * // Structured logging with metadata
 * logger.info("Payment processed", { orderId: "123", amount: 99.99 });
 *
 * // Namespaced logger
 * const authLogger = logger.extend("AuthService");
 * authLogger.debug("Token refresh started");
 */
export interface Logger {
  debug(message: string, metadata?: LogMetadata): void;
  info(message: string, metadata?: LogMetadata): void;
  warn(message: string, metadata?: LogMetadata): void;
  error(message: string, metadata?: LogMetadata): void;
  critical(message: string, metadata?: LogMetadata): void;

  /** Create a child logger with namespace prefix */
  extend(namespace: string): Logger;
}

// Implementation

const isDev = __DEV__;

/**
 * Error tracking transport for critical logs
 * Placeholder for future Sentry/Bugsnag/Crashlytics integration
 */
const errorTrackingTransport: transportFunctionType<object> = (props) => {
  if (isDev) return;
  if (props.level.text !== "error" && props.level.text !== "critical") return;

  // TODO: Integrate with error tracking service
  // Sentry.captureMessage(props.msg, {
  //   level: props.level.text === "critical" ? "fatal" : "error",
  // });
};

const loggerInstance = logger.createLogger({
  transport: [consoleTransport, errorTrackingTransport],
  severity: isDev ? "debug" : "error",
  transportOptions: {
    colors: {
      debug: "grey",
      info: "blue",
      warn: "yellow",
      error: "red",
      critical: "magenta",
    },
  },
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    critical: 4,
  },
  async: !isDev,
  dateFormat: "time",
  printLevel: true,
  printDate: isDev,
  fixedExtLvlLength: true,
});

interface LoggerInstance {
  debug: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
  critical: (message: string) => void;
}

function formatMessage(message: string, metadata?: LogMetadata): string {
  if (!metadata || Object.keys(metadata).length === 0) {
    return message;
  }
  return `${message} ${JSON.stringify(metadata)}`;
}

function createLoggerAdapter(instance: LoggerInstance, namespace?: string): Logger {
  const prefix = namespace ? `[${namespace}] ` : "";

  return {
    debug(message: string, metadata?: LogMetadata): void {
      instance.debug(formatMessage(`${prefix}${message}`, metadata));
    },
    info(message: string, metadata?: LogMetadata): void {
      instance.info(formatMessage(`${prefix}${message}`, metadata));
    },
    warn(message: string, metadata?: LogMetadata): void {
      instance.warn(formatMessage(`${prefix}${message}`, metadata));
    },
    error(message: string, metadata?: LogMetadata): void {
      instance.error(formatMessage(`${prefix}${message}`, metadata));
    },
    critical(message: string, metadata?: LogMetadata): void {
      instance.critical(formatMessage(`${prefix}${message}`, metadata));
    },
    extend(childNamespace: string): Logger {
      const newNamespace = namespace ? `${namespace}:${childNamespace}` : childNamespace;
      return createLoggerAdapter(instance, newNamespace);
    },
  };
}

export const ReactNativeLogger: Logger = createLoggerAdapter(loggerInstance as unknown as LoggerInstance);
