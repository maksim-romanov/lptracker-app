import * as esbuild from "esbuild";

import { generateKindsGLSL } from "../src/assets/js/src/kinds-codegen";
import { generateTokensGLSL } from "../src/assets/js/src/tokens-codegen";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const isWatch = process.argv.includes("--watch");
const isProd = process.argv.includes("--mode=production");

// Supports relative-path includes (resolved against the file's dir) and
// virtual includes (resolved by the generator map below).
const INCLUDE_RE = /^[ \t]*#include\s+"([^"]+)"[ \t]*$/gm;

const virtualIncludes: Record<string, () => string> = {
  kinds: generateKindsGLSL,
  tokens: generateTokensGLSL,
};

async function resolveIncludes(src: string, fromDir: string, seen: Set<string>): Promise<string> {
  // matchAll snapshots into an array — INCLUDE_RE has `g`, so a recursive
  // `exec` loop would share lastIndex state across calls.
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

const options: esbuild.BuildOptions = {
  entryPoints: [resolve(root, "src/assets/js/src/main.ts")],
  outfile: resolve(root, "src/assets/js/hero.bundle.js"),
  bundle: true,
  format: "esm",
  target: ["es2022"],
  minify: isProd,
  sourcemap: isProd ? false : "inline",
  define: {
    __DEV__: isProd ? "false" : "true",
  },
  plugins: [glslPlugin],
  logLevel: "info",
};

if (isWatch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log("build-hero: watching src/assets/js/src for changes…");
} else {
  await esbuild.build(options);
}
