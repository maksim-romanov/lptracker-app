import { cn } from "../../utils/cn";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// Which protocol runs a pool used to be absent from the UI, which reads as Uniswap by default
// and stops being true the moment a position sits on a fork. The colour rides the mark and the
// name is always spelled out beside it — the same split PositionStatus makes, and for the same
// reason: a brand colour is chosen for a logo, not for a contrast ratio.
export const ProtocolBadge = ({ protocol, class: className }: { protocol: ICardVM["protocol"]; class?: string }) => (
  <span class={cn("inline-flex items-center gap-1.5", `protocol-${protocol.slug}`, className)}>
    <span aria-hidden="true" class="protocol-dot size-1.5 shrink-0 rounded-full" />
    {protocol.label}
  </span>
);
