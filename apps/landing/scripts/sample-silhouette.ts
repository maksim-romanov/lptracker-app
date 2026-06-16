import sharp from "sharp";

import { mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const SITE_DATA = resolve(root, "src/_data/site.js");
const BIN_OUT = resolve(root, "src/assets/data/silhouette.bin");

const INT16_SCALE = 32767;

const { default: site } = (await import(pathToFileURL(SITE_DATA).href)) as {
  default: { brand: string };
};
const TEXT = site.brand;
const FONT = "sans-serif Bold 420";
const PARTICLE_COUNT = 42_000;
const MAX_ATTEMPTS = PARTICLE_COUNT * 40;

const [scriptStat, siteStat] = await Promise.all([stat(SCRIPT_PATH), stat(SITE_DATA)]);
const sourceMtime = Math.max(scriptStat.mtimeMs, siteStat.mtimeMs);
try {
  const binStat = await stat(BIN_OUT);
  if (binStat.mtimeMs >= sourceMtime) {
    console.log("sample-silhouette: up-to-date");
    process.exit(0);
  }
} catch {
  // bin missing — fall through to (re)build
}

const { data, info } = await sharp({
  text: {
    text: TEXT,
    font: FONT,
    rgba: true,
  },
})
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const alphaOffset = channels - 1;
console.log(`sample-silhouette: rendered "${TEXT}" → ${width}×${height}`);

const longest = Math.max(width, height);
const halfW = width / longest;
const halfH = height / longest;

const out = new Int16Array(PARTICLE_COUNT * 2);
let written = 0;
let attempts = 0;

while (written < PARTICLE_COUNT && attempts < MAX_ATTEMPTS) {
  attempts++;
  const px = Math.floor(Math.random() * width);
  const py = Math.floor(Math.random() * height);
  const alpha = data[(py * width + px) * channels + alphaOffset] ?? 0;
  if (alpha === 0) continue;
  if (Math.random() * 255 > alpha) continue;

  const nx = (px / width) * 2 - 1;
  const ny = 1 - (py / height) * 2;

  out[written * 2] = Math.round(nx * halfW * INT16_SCALE);
  out[written * 2 + 1] = Math.round(ny * halfH * INT16_SCALE);
  written++;
}

if (written < PARTICLE_COUNT) {
  console.warn(`sample-silhouette: only filled ${written}/${PARTICLE_COUNT} particles in ${attempts} attempts`);
}

await mkdir(dirname(BIN_OUT), { recursive: true });
await writeFile(BIN_OUT, Buffer.from(out.buffer, 0, written * 2 * 2));

console.log(`sample-silhouette: wrote ${written} points → ${BIN_OUT}`);
