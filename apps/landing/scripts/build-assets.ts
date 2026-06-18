import * as esbuild from "esbuild";

import { generateKindsGLSL } from "../src/assets/js/src/kinds-codegen";
import { generateTokensGLSL } from "../src/assets/js/src/tokens-codegen";
import { spawn } from "node:child_process";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const isWatch = process.argv.includes("--watch");
const isProd = process.argv.includes("--mode=production");

const JS_DIR = resolve(root, "src/assets/js");
const CSS_DIR = resolve(root, "src/assets/css");
const MANIFEST_PATH = resolve(root, "src/_data/assets.json");

const INCLUDE_RE = /^[ \t]*#include\s+"([^"]+)"[ \t]*$/gm;
const virtualIncludes: Record<string, () => string> = {
  kinds: generateKindsGLSL,
  tokens: generateTokensGLSL,
};

async function resolveIncludes(src: string, fromDir: string, seen: Set<string>): Promise<string> {
  const matches = Array.from(src.matchAll(INCLUDE_RE));
  if (matches.length === 0) return src;
  const out: string[] = [];
  let lastIdx = 0;
  for (const m of matches) {
    const at = m.index ?? 0;
    out.push(src.slice(lastIdx, at));
    const target = m[1] ?? "";
    let resolved: string;
    if (target in virtualIncludes) {
      const key = `virtual:${target}`;
      if (seen.has(key)) {
        resolved = "";
      } else {
        seen.add(key);
        resolved = virtualIncludes[target]?.() ?? "";
      }
    } else {
      const path = resolve(fromDir, target);
      if (seen.has(path)) {
        resolved = "";
      } else {
        seen.add(path);
        const inc = await readFile(path, "utf8");
        resolved = await resolveIncludes(inc, dirname(path), seen);
      }
    }
    out.push(resolved);
    lastIdx = at + m[0].length;
  }
  out.push(src.slice(lastIdx));
  return out.join("");
}

const glslPlugin: esbuild.Plugin = {
  name: "glsl-include",
  setup(build) {
    build.onLoad({ filter: /\.glsl$/ }, async (args) => {
      const text = await readFile(args.path, "utf8");
      const resolved = await resolveIncludes(text, dirname(args.path), new Set());
      return { contents: resolved, loader: "text" };
    });
  },
};

type ManifestField = "hero" | "css" | "popup";
const manifest: Partial<Record<ManifestField, string>> = {};

async function writeManifest() {
  await mkdir(dirname(MANIFEST_PATH), { recursive: true });
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(MANIFEST_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
}

function recordOutput(field: ManifestField, result: esbuild.BuildResult, ext: ".js" | ".css", urlDir: string) {
  if (!result.metafile) return false;
  const outputs = Object.keys(result.metafile.outputs);
  const out = outputs.find((p) => p.endsWith(ext));
  if (!out) throw new Error(`build produced no ${ext}`);
  const next = `${urlDir}/${basename(out)}`;
  if (manifest[field] === next) return false;
  manifest[field] = next;
  return true;
}

async function cleanOld(dir: string, re: RegExp) {
  for (const f of await readdir(dir)) {
    if (re.test(f)) await rm(resolve(dir, f), { force: true });
  }
}

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { stdio: "inherit" });
    p.on("exit", (code) => (code === 0 ? res() : rej(new Error(`${cmd} ${args.join(" ")} exited ${code}`))));
  });
}

const baseJs: esbuild.BuildOptions = {
  bundle: true,
  format: "esm",
  target: ["es2022"],
  minify: isProd,
  sourcemap: isProd ? false : "inline",
  define: { __DEV__: isProd ? "false" : "true" },
  metafile: true,
  logLevel: "info",
};

const heroOptions: esbuild.BuildOptions = {
  ...baseJs,
  entryPoints: [resolve(root, "src/assets/js/src/main.ts")],
  outdir: JS_DIR,
  entryNames: isProd ? "hero.[hash]" : "hero.bundle",
  plugins: [glslPlugin],
};

const cssOptions: esbuild.BuildOptions = {
  entryPoints: [resolve(root, "src/assets/css/main.css")],
  outdir: CSS_DIR,
  entryNames: isProd ? "main.[hash]" : "main.bundle",
  bundle: true,
  minify: isProd,
  metafile: true,
  logLevel: "info",
};

const popupOptions: esbuild.BuildOptions = {
  ...baseJs,
  entryPoints: [resolve(root, "src/assets/js/src/popup.ts")],
  outdir: JS_DIR,
  entryNames: isProd ? "popup.[hash]" : "popup.bundle",
};

await run("bun", ["scripts/sample-silhouette.ts"]);
await run("bun", ["scripts/build-token-atlas.ts"]);
await cleanOld(JS_DIR, /^hero\.([a-z0-9]+|bundle)\.js$/);
await cleanOld(JS_DIR, /^popup\.([a-z0-9]+|bundle)\.js$/);
await cleanOld(CSS_DIR, /^main\.([a-z0-9]+|bundle)\.css$/);

if (isWatch) {
  const heroCtx = await esbuild.context({
    ...heroOptions,
    plugins: [
      ...(heroOptions.plugins ?? []),
      {
        name: "record-hero",
        setup(build) {
          build.onEnd(async (result) => {
            if (recordOutput("hero", result, ".js", "assets/js")) await writeManifest();
          });
        },
      },
    ],
  });
  const cssCtx = await esbuild.context({
    ...cssOptions,
    plugins: [
      {
        name: "record-css",
        setup(build) {
          build.onEnd(async (result) => {
            if (recordOutput("css", result, ".css", "assets/css")) await writeManifest();
          });
        },
      },
    ],
  });
  const popupCtx = await esbuild.context({
    ...popupOptions,
    plugins: [
      {
        name: "record-popup",
        setup(build) {
          build.onEnd(async (result) => {
            if (recordOutput("popup", result, ".js", "assets/js")) await writeManifest();
          });
        },
      },
    ],
  });
  await heroCtx.watch();
  await cssCtx.watch();
  await popupCtx.watch();
  console.log("build-assets: watching hero + css + popup for changes…");
} else {
  const [heroResult, cssResult, popupResult] = await Promise.all([
    esbuild.build(heroOptions),
    esbuild.build(cssOptions),
    esbuild.build(popupOptions),
  ]);
  recordOutput("hero", heroResult, ".js", "assets/js");
  recordOutput("css", cssResult, ".css", "assets/css");
  recordOutput("popup", popupResult, ".js", "assets/js");
  await writeManifest();
}
