import type { JSX } from "hono/jsx";
import { twMerge } from "tailwind-merge";

// Single merge point for every component's `class` prop. Plain concatenation cannot
// let a caller-supplied utility override the component's base — with both classes on
// the element the winner is decided by their order in the generated stylesheet, not
// by the attribute. Extend via `extendTailwindMerge` here if a custom class group
// (e.g. icon.css's `icon-size-*`) ever needs merging too.
export const cn = twMerge;

// hono/jsx widens `class` to `string | Promise<string>`; components accept the plain
// form only, since a pending Promise cannot be merged into a class list.
export type TIntrinsic<K extends keyof JSX.IntrinsicElements> = Omit<JSX.IntrinsicElements[K], "class"> & { class?: string };
