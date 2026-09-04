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

const TYPE_CLASS: Record<ToastType, string> = {
  loading: "border-outline",
  info: "border-info text-info-text",
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

const BASE_CLASS =
  "fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] flex max-w-[24rem] items-center gap-2 rounded-md border bg-surface-container p-3 text-sm shadow-lg";

export const Toast = ({ id, type, indicator = true, class: className, children, ...rest }: Props) => {
  const icon = TYPE_ICON[type];

  return (
    <output
      id={id}
      role={TYPE_ROLE[type]}
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
