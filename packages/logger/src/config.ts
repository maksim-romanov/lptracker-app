export type LogLevel = "debug" | "info" | "warning" | "error" | "fatal";

const VALID_LEVELS: ReadonlySet<LogLevel> = new Set(["debug", "info", "warning", "error", "fatal"]);

export interface EnvConfig {
  readonly isProd: boolean;
  readonly effectiveLevel: LogLevel;
  readonly appsignalKey: string | null;
}

export function readEnvConfig(env: Record<string, string | undefined>): EnvConfig {
  const isProd = env.NODE_ENV === "production";
  const debugForced = env.DEBUG === "true";
  const requestedLevel = env.LOG_LEVEL;
  const validRequested = requestedLevel && (VALID_LEVELS as Set<string>).has(requestedLevel) ? (requestedLevel as LogLevel) : "info";
  const effectiveLevel: LogLevel = debugForced ? "debug" : validRequested;
  const appsignalKey = env.APPSIGNAL_PUSH_API_KEY ?? null;
  return { isProd, effectiveLevel, appsignalKey };
}
