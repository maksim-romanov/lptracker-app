import type { JSX } from "hono/jsx";
import { extendTailwindMerge } from "tailwind-merge";

// @depthly/theme emits one `text-<role>` utility per type role. tailwind-merge only knows
// Tailwind's own `text-*` scales, so it classified an unknown `text-button` as a *colour* and
// let `text-on-primary` drop it — a button silently lost its type role and fell back to the
// inherited size. Declaring the roles as font-sizes puts them in the group they belong to:
// they now conflict with `text-sm` and with each other, and never with a colour.
// Keep in step with `typography.role` in packages/theme/tokens/typography.ts.
const TYPE_ROLES = ["display", "figure", "figure-small", "title", "headline", "body", "body-small", "label", "caption", "button", "input"];

// Single merge point for every component's `class` prop. Plain concatenation cannot
// let a caller-supplied utility override the component's base — with both classes on
// the element the winner is decided by their order in the generated stylesheet, not
// by the attribute.
export const cn = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: TYPE_ROLES }],
    },
  },
});

// hono/jsx widens `class` to `string | Promise<string>`; components accept the plain
// form only, since a pending Promise cannot be merged into a class list.
export type TIntrinsic<K extends keyof JSX.IntrinsicElements> = Omit<JSX.IntrinsicElements[K], "class"> & { class?: string };
