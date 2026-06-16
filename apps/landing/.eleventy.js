import { spawn } from "node:child_process";

const heroWatchers = [];

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit" });
    p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} exited ${code}`))));
  });
}

export default function (eleventyConfig) {
  eleventyConfig.setServerOptions({ port: 4321 });

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addWatchTarget("./src/assets/");

  eleventyConfig.on("eleventy.before", async ({ runMode }) => {
    if (runMode !== "serve" && runMode !== "watch") return;
    if (heroWatchers.length > 0) return;

    await run("bun", ["scripts/sample-silhouette.ts"]);
    await run("bun", ["scripts/build-token-atlas.ts"]);
    await run("bun", ["scripts/build-hero.ts"]);
    const watcher = spawn("bun", ["scripts/build-hero.ts", "--watch"], { stdio: "inherit" });
    heroWatchers.push(watcher);
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
