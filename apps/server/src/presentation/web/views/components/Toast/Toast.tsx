import type { PropsWithChildren } from "hono/jsx";

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
  info: "border-info text-info",
  warning: "border-warning text-warning",
  error: "border-error text-error",
};

type Props = PropsWithChildren<{ id: string; type: ToastType; class?: string }>;

export const Toast = ({ id, type, class: className, children }: Props) => {
  const icon = TYPE_ICON[type];
  return (
    <output
      id={id}
      role={TYPE_ROLE[type]}
      data-animate="toast"
      class={`htmx-indicator fixed right-4 bottom-4 flex max-w-[24rem] items-center gap-2 rounded-md border bg-surface-container p-3 text-sm shadow-lg ${TYPE_CLASS[type]}${className ? ` ${className}` : ""}`}
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
