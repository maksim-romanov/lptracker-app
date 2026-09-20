// Widget needs aggressive compaction — every glyph above 5 chars costs real
// estate in a 165pt-wide tile. Threshold is 1K (vs 1M in the in-app formatter).
export function formatWidgetAmount(raw: string): string {
  const value = Number(raw);
  if (!Number.isFinite(value)) return raw;
  if (value === 0) return "0";

  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  if (abs < 0.0001) return `${sign}<0.0001`;
  if (abs < 1) return `${sign}${trim(abs.toFixed(4))}`;
  if (abs < 1000) return `${sign}${trim(abs.toFixed(2))}`;
  if (abs < 1e6) return `${sign}${trim((abs / 1e3).toFixed(2))}K`;
  if (abs < 1e9) return `${sign}${trim((abs / 1e6).toFixed(2))}M`;
  if (abs < 1e12) return `${sign}${trim((abs / 1e9).toFixed(2))}B`;
  return `${sign}${trim((abs / 1e12).toFixed(2))}T`;
}

function trim(s: string): string {
  if (!s.includes(".")) return s;
  return s.replace(/\.?0+$/, "");
}

const UNBOUNDED_LOW_LABEL = "0";
const UNBOUNDED_HIGH_LABEL = "∞";
// A price this large is drawn as unbounded rather than as a number, so it is also the value a
// bound that inverts to unbounded saturates at. widget-snapshot.builder's invertBound reads it
// from here rather than repeating the threshold.
export const UNBOUNDED_PRICE = 1e15;
// A price that did not parse is not a magnitude, and must not borrow either unbounded glyph:
// "∞" would report a broken number as a valid end of the scale.
const UNPARSEABLE_LABEL = "—";

// No grouping separators and fewer decimals than the in-app formatter: the labels sit at the
// two ends of a 155pt bar and have to clear each other.
export function formatWidgetPrice(raw: string): string {
  const value = Number(raw);
  if (!Number.isFinite(value)) return UNPARSEABLE_LABEL;
  if (value >= UNBOUNDED_PRICE) return UNBOUNDED_HIGH_LABEL;
  if (value <= 0) return UNBOUNDED_LOW_LABEL;

  if (value >= 1e12) return `${trim((value / 1e12).toFixed(2))}T`;
  if (value >= 1e9) return `${trim((value / 1e9).toFixed(2))}B`;
  if (value >= 1e6) return `${trim((value / 1e6).toFixed(2))}M`;
  if (value >= 1000) return value.toFixed(0);
  if (value >= 1) return trim(value.toFixed(2));
  if (value >= 0.01) return trim(value.toFixed(4));
  if (value >= 1e-6) return trim(value.toFixed(6));
  return value.toExponential(2);
}

export function formatWidgetBoundLabel(bound: string | null, unbounded: "low" | "high"): string {
  if (bound !== null) return formatWidgetPrice(bound);
  return unbounded === "low" ? UNBOUNDED_LOW_LABEL : UNBOUNDED_HIGH_LABEL;
}
