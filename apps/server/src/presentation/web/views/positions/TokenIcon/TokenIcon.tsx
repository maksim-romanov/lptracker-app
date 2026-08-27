import { cn } from "../../utils/cn";

type Props = { url: string; symbol: string; class?: string };

export const TokenIcon = ({ url, symbol, class: className }: Props) =>
  url ? (
    <img src={url} alt={symbol} loading="lazy" class={cn("rounded-full", className)} />
  ) : (
    <span class={cn("rounded-full border border-outline", className)}>{symbol.slice(0, 1)}</span>
  );
