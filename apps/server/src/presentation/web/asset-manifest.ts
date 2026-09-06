import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

interface IAssets {
  js: string;
  css: string;
  themeInit: string;
}

const FALLBACK: IAssets = {
  js: "/static/dist/application.js",
  css: "/static/dist/app.css",
  themeInit: "/static/dist/theme-init.js",
};

// Merged over FALLBACK rather than used as-is: a manifest written before a new
// entry existed would otherwise resolve that entry to undefined and render a
// `<script src="">`, which fails silently.
const load = (): IAssets => {
  try {
    const url = new URL("../../static/dist/manifest.json", import.meta.url);
    return { ...FALLBACK, ...(JSON.parse(readFileSync(fileURLToPath(url), "utf-8")) as Partial<IAssets>) };
  } catch {
    return FALLBACK;
  }
};

export const assets = load();
