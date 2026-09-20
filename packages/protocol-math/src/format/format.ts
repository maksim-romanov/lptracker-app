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

// The same magnitude ladder the widget formats prices with (formatWidgetPrice) — the two
// surfaces show the same position side by side, so a balance must not read as a different
// number in each. For an amount standing alone, `formatTokenAmount` fixes the decimals per
// token instead.
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

// `Number.toString()` switches to exponent notation outside 1e-7..1e21, and a concentrated-
// liquidity price reaches both ends — SHIB/WETH sits near 1e-11. Wire values are plain decimal
// strings, so the exponent is expanded here rather than left for every client to parse.
export function toDecimalString(value: number): string {
  const text = String(value);
  const exponential = /^(-?)(\d+)(?:\.(\d+))?e([+-]\d+)$/.exec(text);
  if (!exponential) return text;

  const [, sign = "", integerDigits = "", fractionDigits = "", exponent = "0"] = exponential;
  const digits = `${integerDigits}${fractionDigits}`;
  const pointIndex = integerDigits.length + Number(exponent);

  if (pointIndex <= 0) return `${sign}0.${"0".repeat(-pointIndex)}${digits}`;
  if (pointIndex >= digits.length) return `${sign}${digits}${"0".repeat(pointIndex - digits.length)}`;
  return `${sign}${digits.slice(0, pointIndex)}.${digits.slice(pointIndex)}`;
}
