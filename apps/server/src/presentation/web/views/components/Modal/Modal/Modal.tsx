import type { PropsWithChildren } from "hono/jsx";

import { Button } from "../../Button/Button";
import { Icon } from "../../Icon/Icon";

type Props = PropsWithChildren<{
  id: string;
  controller?: string;
  class?: string;
  bodyClass?: string;
  dataAttrs?: Record<string, string>;
}>;

export const Modal = ({ id, controller, class: className, bodyClass, dataAttrs, children }: Props) => (
  <dialog
    id={id}
    data-animate="dialog"
    data-controller={controller ? `click-outside ${controller}` : "click-outside"}
    class={`rounded-md border border-outline bg-surface-container p-0 text-on-surface${className ? ` ${className}` : ""}`}
    {...dataAttrs}
  >
    <div class={bodyClass ?? "flex w-full flex-col gap-4 p-4"}>
      <form method="dialog" class="flex justify-end">
        <Button type="submit" aria-label="Close" class="p-2">
          <Icon name="close" size={18} />
        </Button>
      </form>
      {children}
    </div>
  </dialog>
);
