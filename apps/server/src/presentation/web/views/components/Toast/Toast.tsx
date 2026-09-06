import type { PropsWithChildren } from "hono/jsx";

import { cn, type TIntrinsic } from "../../utils/cn";
import { Icon, type TIconName } from "../Icon/Icon";

type ToastType = "loading" | "info" | "warning" | "error";

const TYPE_ICON: Partial<Record<ToastType, TIconName>> = {
  warning: "alert",
  error: "alert",
};

const TYPE_ROLE: Record<ToastType, "alert" | "status"> = {
  loading: "status",
  info: "status",
  warning: "alert",
  error: "alert",
};

// info is neutral on purpose, not a hue: it confirms rather than alerts, and DESIGN.md's
// Color-Is-Information Rule reserves color for something that actually needs to stand out.
const TYPE_CLASS: Record<ToastType, string> = {
  loading: "border-outline",
  info: "border-outline",
  warning: "border-warning text-warning-text",
  error: "border-error text-error-text",
};

type Props = PropsWithChildren<
  TIntrinsic<"output"> & {
    id: string;
    type: ToastType;
    // Visibility is driven by htmx request state by default; pass false for a
    // toast a controller opens itself (see toast.css's [data-open] branch).
    indicator?: boolean;
  }
>;

// `[popover]`'s UA stylesheet sets `inset: 0` and `margin: auto` — the auto-centering it uses
// when a popover has no author position. `top-auto right-auto m-0` cancel that so `left`/`bottom`
// are the only offsets left.
// Bottom-left, not bottom-right: the wallet sidebar docks at `right: 1rem`, same `max-w-[24rem]`
// width — a right-anchored toast would sit exactly on top of its own bottom controls.
const BASE_CLASS =
  "fixed inset-auto top-auto right-auto left-4 bottom-[max(1rem,env(safe-area-inset-bottom))] m-0 flex max-w-[24rem] items-center gap-2 rounded-md border bg-surface-container p-3 text-sm shadow-lg";

export const Toast = ({ id, type, indicator = true, class: className, children, ...rest }: Props) => {
  const icon = TYPE_ICON[type];

  return (
    <output
      id={id}
      role={TYPE_ROLE[type]}
      // application.ts promotes this into the top layer at the moment it turns on — no z-index
      // reaches above an open <dialog> (position-modal, wallet-sidebar) otherwise. Actual
      // visibility stays exactly what it already was: opacity/data-open, driven by toast.css.
      popover="manual"
      data-animate="toast"
      class={cn(BASE_CLASS, TYPE_CLASS[type], indicator && "htmx-indicator", className)}
      {...rest}
    >
      {type === "loading" ? (
        <span aria-hidden="true" class="toast-spinner h-4 w-4 shrink-0 animate-spin rounded-full" />
      ) : (
        icon && <Icon name={icon} size={18} />
      )}
      <span>{children}</span>
    </output>
  );
};
