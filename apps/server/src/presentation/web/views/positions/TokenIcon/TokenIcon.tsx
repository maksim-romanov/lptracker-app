type Props = { url: string; symbol: string; class?: string };

export const TokenIcon = ({ url, symbol, class: className }: Props) =>
  url ? (
    <img src={url} alt={symbol} loading="lazy" class={`rounded-full${className ? ` ${className}` : ""}`} />
  ) : (
    <span class={`rounded-full border border-outline${className ? ` ${className}` : ""}`}>{symbol.slice(0, 1)}</span>
  );
