import { configure, type Sink } from "@logtape/logtape";

import { readEnvConfig } from "./config";
import { type AppsignalClient, createAppsignalSink } from "./sinks/appsignal";
import { consoleSink } from "./sinks/console";
import { AsyncLocalStorage } from "node:async_hooks";

type LogLevelName = "debug" | "info" | "warning" | "error" | "fatal";

interface LoggerConfigEntry {
  readonly category: string[];
  readonly sinks: string[];
  readonly lowestLevel?: LogLevelName;
}

export interface InstallLoggerOptions {
  readonly app: string;
  readonly env?: Record<string, string | undefined>;
  readonly appsignalClient?: AppsignalClient;
  readonly extraSinks?: Record<string, Sink>;
  readonly extraLoggers?: readonly {
    readonly category: readonly string[];
    readonly sinks: readonly string[];
    readonly lowestLevel?: LogLevelName;
  }[];
}

const LEVEL_ORDER: Record<LogLevelName, number> = {
  debug: 0,
  info: 1,
  warning: 2,
  error: 3,
  fatal: 4,
};

function mergeLoggers(entries: { category: readonly string[]; sinks: readonly string[]; lowestLevel?: LogLevelName }[]): LoggerConfigEntry[] {
  const byKey = new Map<string, { category: string[]; sinks: Set<string>; lowestLevel?: LogLevelName }>();
  for (const entry of entries) {
    const key = JSON.stringify(entry.category);
    const existing = byKey.get(key);
    if (existing) {
      for (const s of entry.sinks) existing.sinks.add(s);
      if (entry.lowestLevel !== undefined) {
        if (existing.lowestLevel === undefined) {
          existing.lowestLevel = entry.lowestLevel;
        } else if (LEVEL_ORDER[entry.lowestLevel] < LEVEL_ORDER[existing.lowestLevel]) {
          existing.lowestLevel = entry.lowestLevel;
        }
      }
    } else {
      byKey.set(key, {
        category: [...entry.category],
        sinks: new Set(entry.sinks),
        lowestLevel: entry.lowestLevel,
      });
    }
  }
  return Array.from(byKey.values()).map((e) => ({
    category: e.category,
    sinks: Array.from(e.sinks),
    lowestLevel: e.lowestLevel,
  }));
}

export async function installLogger(opts: InstallLoggerOptions): Promise<void> {
  const env = opts.env ?? (process.env as Record<string, string | undefined>);
  const cfg = readEnvConfig(env);

  const sinks: Record<string, Sink> = {
    console: consoleSink(cfg.isProd),
    ...(opts.extraSinks ?? {}),
  };
  if (opts.appsignalClient) {
    sinks.appsignal = createAppsignalSink(opts.appsignalClient);
  }

  const rawLoggers: { category: readonly string[]; sinks: readonly string[]; lowestLevel?: LogLevelName }[] = [
    { category: ["logtape", "meta"], sinks: ["console"], lowestLevel: "error" },
    { category: [opts.app], sinks: ["console"], lowestLevel: cfg.effectiveLevel },
  ];
  if (opts.appsignalClient) {
    rawLoggers.push({ category: [opts.app], sinks: ["appsignal"], lowestLevel: "fatal" });
  }
  if (opts.extraLoggers) {
    rawLoggers.push(...opts.extraLoggers);
  }

  const loggers = mergeLoggers(rawLoggers);

  await configure({
    contextLocalStorage: new AsyncLocalStorage(),
    sinks,
    loggers,
    reset: true,
  });
}
