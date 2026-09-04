import { cn } from "../../utils/cn";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

export const ProtocolBadge = ({ protocol, class: className }: { protocol: ICardVM["protocol"]; class?: string }) => (
  <span class={cn("inline-flex min-w-0 items-center gap-1.5", `protocol-${protocol.slug}`, className)}>
    <span aria-hidden="true" class="protocol-dot size-1.5 shrink-0 rounded-full" />
    <span class="truncate">{protocol.label}</span>
  </span>
);
