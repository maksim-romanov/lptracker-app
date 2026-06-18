import { spawn } from "node:child_process";

const watcher = { proc: null };

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
  eleventyConfig.addWatchTarget("./src/_data/");

  eleventyConfig.on("eleventy.before", async ({ runMode }) => {
    if (runMode !== "serve" && runMode !== "watch") return;
    if (watcher.proc) return;
    await run("bun", ["scripts/build-assets.ts"]);
    watcher.proc = spawn("bun", ["scripts/build-assets.ts", "--watch"], { stdio: "inherit" });
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
