export const formatUsd = (value: number | null): string => {
  if (value === null) return "—";
  if (value === 0) return "$0.00";
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

export const formatAmount = (value: number): string => {
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (abs >= 1) return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
  if (abs >= 0.0001) return value.toFixed(4);
  return value.toExponential(2);
};

export const formatPrice = (value: number): string => {
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1_000) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (abs >= 1) return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  if (abs >= 0.01) return value.toFixed(4);
  if (abs >= 0.0001) return value.toFixed(6);
  return value.toPrecision(3);
};

export const truncateAddress = (address: string, head = 6, tail = 4): string => {
  if (address.length <= head + tail + 2) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
};
