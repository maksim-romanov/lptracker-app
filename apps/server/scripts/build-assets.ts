import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dev = process.argv.includes("--dev");
const distDir = join(import.meta.dir, "../src/static/dist");

if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Remove stale outputs so old hashed files don't accumulate.
for (const file of readdirSync(distDir)) {
  if (/^app.*\.(js|css)$/.test(file) || file === "manifest.json") {
    rmSync(join(distDir, file));
  }
}

// ── JS ───────────────────────────────────────────────────────────────────────

const jsResult = await Bun.build({
  entrypoints: [join(import.meta.dir, "../src/presentation/web/client/application.ts")],
  outdir: distDir,
  naming: dev ? "[name].[ext]" : "[name]-[hash].[ext]",
  minify: !dev,
  target: "browser",
  // Classic <script> (not type=module) — must not emit top-level `export`.
  format: "iife",
});

if (!jsResult.success) {
  console.error("JS build failed:");
  for (const log of jsResult.logs) console.error(log);
  process.exit(1);
}

const jsArtifact = jsResult.outputs.find((o) => o.kind === "entry-point");
if (!jsArtifact) {
  console.error("No entry-point artifact found in Bun.build output");
  process.exit(1);
}
const jsName = jsArtifact.path.split("/").pop()!;

// ── CSS ──────────────────────────────────────────────────────────────────────

const tailwindBin = join(import.meta.dir, "../node_modules/.bin/tailwindcss");
const cssInput = join(import.meta.dir, "../src/presentation/web/styles/app.css");

let cssName: string;

if (dev) {
  const cssOut = join(distDir, "app.css");
  const proc = Bun.spawn([tailwindBin, "-i", cssInput, "-o", cssOut], {
    cwd: join(import.meta.dir, ".."),
    stdout: "pipe",
    stderr: "pipe",
  });
  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    const err = await new Response(proc.stderr).text();
    console.error("Tailwind CSS build failed:\n", err);
    process.exit(1);
  }
  cssName = "app.css";
} else {
  const tmpOut = join(distDir, ".app.tmp.css");
  const proc = Bun.spawn([tailwindBin, "-i", cssInput, "-o", tmpOut, "--minify"], {
    cwd: join(import.meta.dir, ".."),
    stdout: "pipe",
    stderr: "pipe",
  });
  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    const err = await new Response(proc.stderr).text();
    console.error("Tailwind CSS build failed:\n", err);
    process.exit(1);
  }

  const contents = await Bun.file(tmpOut).arrayBuffer();
  const hash = Bun.hash(contents).toString(16).slice(0, 8);
  cssName = `app-${hash}.css`;
  await Bun.write(join(distDir, cssName), contents);
  rmSync(tmpOut);
}

// ── Manifest ─────────────────────────────────────────────────────────────────

const manifest = { js: `/static/dist/${jsName}`, css: `/static/dist/${cssName}` };
writeFileSync(join(distDir, "manifest.json"), JSON.stringify(manifest, null, 2));

console.log(`assets built [${dev ? "dev" : "prod"}]: ${jsName}, ${cssName}`);
