import { DEFAULT_POSITIONS_LAYOUT, type TPositionsLayout } from "../../positions-layout";
import { layoutPrefs } from "./layout-prefs.store";

// ~850px is the table's own measured minimum before the Pool cell clips a long pair name.
// Nothing in the CSS encodes this — the table and card presentations are separate markup, not
// one tree restyled at a breakpoint — so the threshold has to live here.
const TABLE_QUERY = "(min-width: 60rem)";

const resolve = (matches: boolean): TPositionsLayout => (matches ? "table" : DEFAULT_POSITIONS_LAYOUT);

const query = (): MediaQueryList | null => (typeof window === "undefined" ? null : window.matchMedia(TABLE_QUERY));

export const currentLayout = (): TPositionsLayout => layoutPrefs.get() ?? resolve(query()?.matches ?? false);

export const onLayoutChange = (handle: (layout: TPositionsLayout) => void): void => {
  query()?.addEventListener("change", (event) => {
    if (layoutPrefs.get() === null) handle(resolve(event.matches));
  });
};
