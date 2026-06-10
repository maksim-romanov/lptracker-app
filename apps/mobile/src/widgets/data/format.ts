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
