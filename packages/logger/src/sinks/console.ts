import { getConsoleSink, jsonLinesFormatter, type Sink } from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";

export function consoleSink(isProd: boolean): Sink {
  return getConsoleSink({
    formatter: isProd
      ? jsonLinesFormatter
      : getPrettyFormatter({
          properties: true,
          inspectOptions: { depth: 3, colors: true },
        }),
  });
}
