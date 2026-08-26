import type { JSX, PropsWithChildren } from "hono/jsx";

import { Modal } from "../Modal/Modal";

type Props = PropsWithChildren<JSX.IntrinsicElements["dialog"] & { id: string }>;

// key destructured out — spreading it onward into <Modal> conflicts with its IntrinsicAttributes.
export const Sidebar = ({ id, key: _key, class: className, children, ...rest }: Props) => (
  <Modal id={id} class={`sidebar${className ? ` ${className}` : ""}`} bodyClass="flex h-full w-full flex-col gap-4 p-4" {...rest}>
    {children}
  </Modal>
);
