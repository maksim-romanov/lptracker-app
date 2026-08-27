import { DEFAULT_POSITIONS_LAYOUT, type TPositionsLayout } from "../../positions-layout";

// Must track Tailwind's `md` breakpoint, which is what Positions.tsx styles the two
// presentations against. There is no way to read it back out of the compiled CSS.
const TABLE_QUERY = "(min-width: 48rem)";

const resolve = (matches: boolean): TPositionsLayout => (matches ? "table" : DEFAULT_POSITIONS_LAYOUT);

const query = (): MediaQueryList | null => (typeof window === "undefined" ? null : window.matchMedia(TABLE_QUERY));

export const currentLayout = (): TPositionsLayout => resolve(query()?.matches ?? false);

// Fires only when the viewport crosses the breakpoint, not on every resize frame.
export const onLayoutChange = (handle: (layout: TPositionsLayout) => void): void => {
  query()?.addEventListener("change", (event) => handle(resolve(event.matches)));
};
