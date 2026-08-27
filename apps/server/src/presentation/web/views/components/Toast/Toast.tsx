import type { JSX, PropsWithChildren } from "hono/jsx";

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

type Props = PropsWithChildren<
  JSX.IntrinsicElements["output"] & {
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
  // Joined from parts rather than interpolated: a conditional class inside a template
  // literal is what `biome check --unsafe` mangles when it re-sorts the attribute.
  const classes = [BASE_CLASS, TYPE_CLASS[type], indicator ? "htmx-indicator" : "", className ?? ""].filter(Boolean).join(" ");

  return (
    <output id={id} role={TYPE_ROLE[type]} data-animate="toast" class={classes} {...rest}>
      {type === "loading" ? (
        <span aria-hidden="true" class="toast-spinner h-4 w-4 shrink-0 animate-spin rounded-full" />
      ) : (
        icon && <Icon name={icon} size={18} />
      )}
      <span>{children}</span>
    </output>
  );
};
