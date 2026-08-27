// The board has two presentations with genuinely different markup, and the choice
// crosses the wire: the client measures the viewport (client/lib/layout.ts) and sends
// it, the route validates it, the view branches on it. Declaring the set once keeps the
// Valibot schemas and the TypeScript union from drifting apart — a mismatch between
// them would type-check and test clean, then fail at runtime.
export const POSITIONS_LAYOUTS = ["table", "cards"] as const;

export type TPositionsLayout = (typeof POSITIONS_LAYOUTS)[number];

// The narrow presentation is the one that survives an unknown viewport.
export const DEFAULT_POSITIONS_LAYOUT: TPositionsLayout = "cards";
