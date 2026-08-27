import type { PropsWithChildren } from "hono/jsx";

import { cn, type TIntrinsic } from "../../../utils/cn";
import { Button } from "../../Button/Button";
import { Icon } from "../../Icon/Icon";

type Props = PropsWithChildren<
  TIntrinsic<"dialog"> & {
    id: string;
    title?: string;
    action?: string;
    bodyClass?: string;
  }
>;

export const Modal = ({ id, title, action, class: className, bodyClass, children, ...rest }: Props) => (
  <dialog
    id={id}
    data-animate="dialog"
    data-controller="dialog"
    // `:self` resolves to `element === event.target`, i.e. a backdrop click.
    data-action={`click->dialog#close:self${action ? ` ${action}` : ""}`}
    aria-labelledby={title ? `${id}-title` : undefined}
    class={cn("rounded-md border border-outline bg-surface-container p-0 text-on-surface", className)}
    {...rest}
  >
    <div class={bodyClass ?? "flex w-full flex-col gap-4 p-4"}>
      <form method="dialog" class={`flex items-center gap-2 ${title ? "justify-between" : "justify-end"}`}>
        {title && (
          <h2 id={`${id}-title`} class="font-medium text-lg">
            {title}
          </h2>
        )}
        <Button type="submit" aria-label="Close" class="p-2">
          <Icon name="close" size={18} />
        </Button>
      </form>
      {children}
    </div>
  </dialog>
);
