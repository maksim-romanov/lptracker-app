import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

interface IAssets {
  js: string;
  css: string;
}

const FALLBACK: IAssets = { js: "/static/dist/application.js", css: "/static/dist/app.css" };

const load = (): IAssets => {
  try {
    const url = new URL("../../static/dist/manifest.json", import.meta.url);
    return JSON.parse(readFileSync(fileURLToPath(url), "utf-8")) as IAssets;
  } catch {
    return FALLBACK;
  }
};

export const assets = load();
