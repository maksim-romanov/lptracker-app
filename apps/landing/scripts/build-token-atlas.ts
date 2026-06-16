import sharp from "sharp";

import { ATLAS_COLS, TOKENS } from "../src/assets/js/src/tokens";
import { mkdir, readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const TOKENS_DIR = resolve(root, "src/assets/img/tokens");
const OUT = resolve(root, "src/assets/img/token-atlas.webp");

const CELL_SIZE = 64;
const ATLAS_ROWS = Math.ceil(TOKENS.length / ATLAS_COLS);
const ATLAS_W = ATLAS_COLS * CELL_SIZE;
const ATLAS_H = ATLAS_ROWS * CELL_SIZE;

const tokensSourcePath = resolve(root, "src/assets/js/src/tokens.ts");
const sourceStats = await Promise.all([
  stat(tokensSourcePath),
  ...TOKENS.map((t) => stat(resolve(TOKENS_DIR, `${t.ticker.toLowerCase()}.svg`))),
]);
const newestSourceMs = Math.max(...sourceStats.map((s) => s.mtimeMs));

try {
  const outStat = await stat(OUT);
  if (outStat.mtimeMs >= newestSourceMs) {
    console.log("build-token-atlas: up-to-date");
    process.exit(0);
  }
} catch {
  // atlas missing — fall through to (re)build
}

const composites = await Promise.all(
  TOKENS.map(async (token, i) => {
    const col = i % ATLAS_COLS;
    const row = Math.floor(i / ATLAS_COLS);
    const svgPath = resolve(TOKENS_DIR, `${token.ticker.toLowerCase()}.svg`);
    const svg = await readFile(svgPath);
    // density=288 → 3× default, so 32×32 viewBox SVGs rasterise crisply.
    const png = await sharp(svg, { density: 288 })
      .resize(CELL_SIZE, CELL_SIZE, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    return { input: png, top: row * CELL_SIZE, left: col * CELL_SIZE };
  }),
);

await mkdir(dirname(OUT), { recursive: true });
await sharp({
  create: {
    width: ATLAS_W,
    height: ATLAS_H,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(composites)
  .webp({ quality: 92, alphaQuality: 100, effort: 6 })
  .toFile(OUT);

console.log(`build-token-atlas: ${TOKENS.length} tokens → ${ATLAS_W}×${ATLAS_H} → ${OUT}`);
