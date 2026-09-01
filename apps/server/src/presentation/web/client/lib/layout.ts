import { DEFAULT_POSITIONS_LAYOUT, type TPositionsLayout } from "../../positions-layout";
import { layoutPrefs } from "./layout-prefs.store";

// The table's own minimum, measured: below ~850px of table width the Pool cell starts
// clipping a long pair name, which is the first thing to give now that the amounts are
// one number per line. Nothing in the CSS encodes this — the two presentations are
// separate markup, not one tree restyled at a breakpoint — so the threshold lives here
// or nowhere. The frame's own chrome costs ~66px, leaving headroom at this width.
const TABLE_QUERY = "(min-width: 60rem)";

const resolve = (matches: boolean): TPositionsLayout => (matches ? "table" : DEFAULT_POSITIONS_LAYOUT);

const query = (): MediaQueryList | null => (typeof window === "undefined" ? null : window.matchMedia(TABLE_QUERY));

// An explicit choice wins over the measurement — the viewport says what fits, not what the
// user wants, and on a wide screen both presentations fit.
export const currentLayout = (): TPositionsLayout => layoutPrefs.get() ?? resolve(query()?.matches ?? false);

// Fires only when the viewport crosses the breakpoint, not on every resize frame — and stays
// quiet once the user has chosen, since crossing the breakpoint no longer changes anything.
export const onLayoutChange = (handle: (layout: TPositionsLayout) => void): void => {
  query()?.addEventListener("change", (event) => {
    if (layoutPrefs.get() === null) handle(resolve(event.matches));
  });
};
