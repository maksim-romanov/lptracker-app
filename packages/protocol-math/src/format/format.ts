import numbro from "numbro";

const DEFAULT_MANTISSA = 6;
const COMPACT_THRESHOLD = 1e6;

function formatCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${numbro(value / 1e12).format({ mantissa: 2, trimMantissa: true })}T`;
  if (abs >= 1e9) return `${numbro(value / 1e9).format({ mantissa: 2, trimMantissa: true })}B`;
  if (abs >= 1e6) return `${numbro(value / 1e6).format({ mantissa: 2, trimMantissa: true })}M`;
  return `${numbro(value / 1e3).format({ mantissa: 2, trimMantissa: true })}K`;
}

export function formatTokenAmount(raw: string, displayDecimals?: number): string {
  const value = Number(raw);
  if (!Number.isFinite(value) || value === 0) return "0";
  const abs = Math.abs(value);
  const mantissa = displayDecimals ?? DEFAULT_MANTISSA;
  if (abs < 10 ** -mantissa) return `< 0.${"0".repeat(mantissa - 1)}1`;
  if (abs >= COMPACT_THRESHOLD) return formatCompact(value);
  return numbro(value).format({ thousandSeparated: true, mantissa, trimMantissa: true });
}

const SHORT_MIN = 1e-4;
const SHORT_THOUSANDS_MANTISSA = 2;
const SHORT_MANTISSA = 4;

// The same magnitude ladder the widget formats prices with (PriceMath.format) — the two
// surfaces show the same position side by side, so a balance must not read as a different
// number in each. `formatTokenAmount` fixes the decimals per token instead, which is right
// where the amount stands alone but puts a 6-decimal balance next to a 2-decimal one in a
// list column that has to hold both.
export function formatTokenAmountShort(raw: string): string {
  const value = Number(raw);
  if (!Number.isFinite(value) || value === 0) return "0";
  const abs = Math.abs(value);
  if (abs < SHORT_MIN) return "< 0.0001";
  if (abs >= COMPACT_THRESHOLD) return formatCompact(value);
  const mantissa = abs >= 1000 ? SHORT_THOUSANDS_MANTISSA : SHORT_MANTISSA;
  return numbro(value).format({ thousandSeparated: true, mantissa, trimMantissa: true });
}

export function formatPrice(price: number): string {
  if (!Number.isFinite(price) || price <= 0) return "—";
  if (price >= 1e15) return "∞";
  if (price <= 1e-15) return "0";
  if (price >= COMPACT_THRESHOLD) return formatCompact(price);
  if (price >= 1000) return numbro(price).format({ thousandSeparated: true, mantissa: 2 });
  if (price >= 1) return numbro(price).format({ thousandSeparated: true, mantissa: 4 });
  if (price >= 0.0001) return numbro(price).format({ mantissa: 6 });
  if (price >= 0.000001) return numbro(price).format({ mantissa: 8 });
  return price.toExponential(2);
}
