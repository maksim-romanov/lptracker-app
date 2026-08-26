import type { PropsWithChildren } from "hono/jsx";

import { Icon, type TIconName } from "../../Icon/Icon";

type Variant = "error" | "warning" | "success";

const VARIANT_ICON: Record<Variant, TIconName> = {
  error: "alert",
  warning: "alert",
  success: "check",
};

// error/warning are time-sensitive (assertive `alert`); success is a confirmation, not an
// interruption, so it uses the polite `status` role.
const VARIANT_ROLE: Record<Variant, "alert" | "status"> = {
  error: "alert",
  warning: "alert",
  success: "status",
};

const VARIANT_CLASS: Record<Variant, string> = {
  error: "border-error text-error",
  warning: "border-warning text-warning",
  success: "border-success text-success",
};

type Props = PropsWithChildren<{ variant: Variant; class?: string }>;

export const Banner = ({ variant, class: className, children }: Props) => (
  <div
    role={VARIANT_ROLE[variant]}
    class={`flex items-center gap-2 rounded-md border p-3 ${VARIANT_CLASS[variant]}${className ? ` ${className}` : ""}`}
  >
    <Icon name={VARIANT_ICON[variant]} size={18} />
    <span>{children}</span>
  </div>
);
