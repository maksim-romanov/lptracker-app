import { DEFAULT_POSITIONS_LAYOUT, type TPositionsLayout } from "../../positions-layout";

// The table's own minimum, measured: below ~850px of table width the Pool cell starts
// clipping a long pair name, which is the first thing to give now that the amounts are
// one number per line. Nothing in the CSS encodes this — the two presentations are
// separate markup, not one tree restyled at a breakpoint — so the threshold lives here
// or nowhere. The frame's own chrome costs ~66px, leaving headroom at this width.
const TABLE_QUERY = "(min-width: 60rem)";

const resolve = (matches: boolean): TPositionsLayout => (matches ? "table" : DEFAULT_POSITIONS_LAYOUT);

const query = (): MediaQueryList | null => (typeof window === "undefined" ? null : window.matchMedia(TABLE_QUERY));

export const currentLayout = (): TPositionsLayout => resolve(query()?.matches ?? false);

// Fires only when the viewport crosses the breakpoint, not on every resize frame.
export const onLayoutChange = (handle: (layout: TPositionsLayout) => void): void => {
  query()?.addEventListener("change", (event) => handle(resolve(event.matches)));
};
