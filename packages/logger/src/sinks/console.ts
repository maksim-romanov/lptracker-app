import { getConsoleSink, jsonLinesFormatter, type Sink } from "@logtape/logtape";
import { prettyFormatter } from "@logtape/pretty";

export function consoleSink(isProd: boolean): Sink {
  return getConsoleSink({
    formatter: isProd ? jsonLinesFormatter : prettyFormatter,
  });
}
