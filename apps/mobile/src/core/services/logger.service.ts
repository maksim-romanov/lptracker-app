import { consoleTransport, logger, type transportFunctionType } from "react-native-logs";

export interface LogMetadata {
  [key: string]: unknown;
}

export type LogLevel = "debug" | "info" | "warn" | "error" | "critical";

export interface Logger {
  debug(message: string, metadata?: LogMetadata): void;
  info(message: string, metadata?: LogMetadata): void;
  warn(message: string, metadata?: LogMetadata): void;
  error(message: string, metadata?: LogMetadata): void;
  critical(message: string, metadata?: LogMetadata): void;
  extend(namespace: string): Logger;
}

const isDev = __DEV__;

const errorTrackingTransport: transportFunctionType<object> = (props) => {
  if (isDev) return;
  if (props.level.text !== "error" && props.level.text !== "critical") return;
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
