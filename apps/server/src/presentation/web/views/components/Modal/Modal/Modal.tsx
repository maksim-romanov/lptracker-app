import type { JSX, PropsWithChildren } from "hono/jsx";

import { Button } from "../../Button/Button";
import { Icon } from "../../Icon/Icon";

type Props = PropsWithChildren<
  JSX.IntrinsicElements["dialog"] & {
    id: string;
    title?: string;
    controller?: string;
    bodyClass?: string;
  }
>;

export const Modal = ({ id, title, controller, class: className, bodyClass, children, ...rest }: Props) => (
  <dialog
    id={id}
    data-animate="dialog"
    data-controller={controller ? `click-outside ${controller}` : "click-outside"}
    aria-labelledby={title ? `${id}-title` : undefined}
    class={`rounded-md border border-outline bg-surface-container p-0 text-on-surface${className ? ` ${className}` : ""}`}
    {...rest}
  >
    <div class={bodyClass ?? "flex w-full flex-col gap-4 p-4"}>
      <form method="dialog" class={`flex items-center gap-2 ${title ? "justify-between" : "justify-end"}`}>
        {title && (
          <h2 id={`${id}-title`} class="text-lg font-medium">
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
