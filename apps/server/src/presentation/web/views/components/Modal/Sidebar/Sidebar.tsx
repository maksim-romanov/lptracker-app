import type { PropsWithChildren } from "hono/jsx";

import { cn, type TIntrinsic } from "../../../utils/cn";
import { Modal } from "../Modal/Modal";

type Props = PropsWithChildren<TIntrinsic<"dialog"> & { id: string }>;

// key destructured out — spreading it onward into <Modal> conflicts with its IntrinsicAttributes.
export const Sidebar = ({ id, key: _key, class: className, children, ...rest }: Props) => (
  <Modal id={id} class={cn("sidebar", className)} bodyClass="flex h-full w-full flex-col gap-4 p-4" {...rest}>
    {children}
  </Modal>
);
