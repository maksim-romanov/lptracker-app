// `IS_*`, `kindSpreadMul`, `kindRestSize` GLSL helpers are emitted from this
// table at build time — see kinds-codegen.ts. Don't duplicate kind-specific
// constants into shaders.

import { TOKENS } from "./tokens";

export type KindName = "DUST" | "STAR" | "PLANET" | "ASTEROID" | "GALAXY" | "SPACESHIP" | "BLACK_HOLE" | "TOKEN";

export type KindRestSize = { type: "passthrough" } | { type: "fixed"; value: number } | { type: "hashRange"; min: number; max: number };

export type KindMotion = "brownian" | "drift" | "orbit";

export interface KindConfig {
  id: number;
  spreadMul: number;
  restSize: KindRestSize;
  motion: KindMotion;
}

export const KINDS: Record<KindName, KindConfig> = {
  DUST: { id: 0, spreadMul: 1.0, restSize: { type: "passthrough" }, motion: "brownian" },
  STAR: { id: 1, spreadMul: 1.0, restSize: { type: "passthrough" }, motion: "drift" },
  PLANET: { id: 2, spreadMul: 0.65, restSize: { type: "fixed", value: 1.9 }, motion: "orbit" },
  ASTEROID: { id: 3, spreadMul: 1.0, restSize: { type: "passthrough" }, motion: "orbit" },
  GALAXY: { id: 4, spreadMul: 0.55, restSize: { type: "hashRange", min: 1.6, max: 3.8 }, motion: "drift" },
  SPACESHIP: { id: 5, spreadMul: 1.0, restSize: { type: "passthrough" }, motion: "orbit" },
  BLACK_HOLE: { id: 6, spreadMul: 0.7, restSize: { type: "fixed", value: 2.0 }, motion: "orbit" },
  TOKEN: { id: 7, spreadMul: 0.55, restSize: { type: "fixed", value: 3.0 }, motion: "orbit" },
};

// Tokens are placed by `pickTokenSlots()` (guarantees uniqueness), not this
// function — `tokenIndex` stays 0 here. RNG-call order is significant.
export function pickKindAndSize(rng: () => number): {
  kind: number;
  sizeScale: number;
  tokenIndex: number;
} {
  const roll = rng();
  if (roll < 0.7) return { kind: KINDS.DUST.id, sizeScale: 0.5 + rng() * 0.55, tokenIndex: 0 };
  if (roll < 0.92) return { kind: KINDS.STAR.id, sizeScale: 1.0 + rng() * 1.0, tokenIndex: 0 };
  if (roll < 0.988) return { kind: KINDS.STAR.id, sizeScale: 2.0 + rng() * 1.6, tokenIndex: 0 };

  const special = rng();
  if (special < 0.26) {
    const ps = rng();
    let sizeScale: number;
    if (ps < 0.35) sizeScale = 3.0 + rng() * 2.0;
    else if (ps < 0.85) sizeScale = 5.0 + rng() * 4.0;
    else sizeScale = 9.0 + rng() * 5.5;
    return { kind: KINDS.PLANET.id, sizeScale, tokenIndex: 0 };
  }
  if (special < 0.63) return { kind: KINDS.ASTEROID.id, sizeScale: 1.8 + rng() * 2.2, tokenIndex: 0 };
  if (special < 0.75) return { kind: KINDS.GALAXY.id, sizeScale: 4.0 + rng() ** 0.8 * 18.0, tokenIndex: 0 };
  if (special < 0.9) return { kind: KINDS.SPACESHIP.id, sizeScale: 2.5 + rng() * 2.0, tokenIndex: 0 };
  return { kind: KINDS.BLACK_HOLE.id, sizeScale: 4.0 + rng() * 3.0, tokenIndex: 0 };
}

// Guarantees one of each token + ~25% chance of one duplicate, ~10% of a second.
export function pickTokenSlots(particleCount: number, rng: () => number): Map<number, number> {
  const slots = new Map<number, number>();
  const taken = new Set<number>();
  const claim = (tokenIndex: number) => {
    let pos = 0;
    do {
      pos = Math.floor(rng() * particleCount);
    } while (taken.has(pos));
    taken.add(pos);
    slots.set(pos, tokenIndex);
  };

  for (let i = 0; i < TOKENS.length; i++) claim(i);
  if (rng() < 0.25) claim(Math.floor(rng() * TOKENS.length));
  if (rng() < 0.1) claim(Math.floor(rng() * TOKENS.length));
  return slots;
}

export function tokenSizeScale(rng: () => number): number {
  return 7.0 + rng() * 13.0;
}

// Two horizontal rows above + below the CTA copy block; centre stays empty.
// 8 pairs = 16 slots, enough for 14 tokens + up to 2 duplicates.
export const TOKEN_SLOT_POSITIONS: readonly [number, number][] = (() => {
  const PAIRS = 8;
  const Y_ROW = 0.65;
  const arr: [number, number][] = [];
  for (let i = 0; i < PAIRS; i++) {
    const x = -1 + (2 * (i + 0.5)) / PAIRS;
    arr.push([x, +Y_ROW]);
    arr.push([x, -Y_ROW]);
  }
  return arr;
})();
