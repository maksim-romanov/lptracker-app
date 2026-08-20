const { withDangerousMod } = require("expo/config-plugins");
const { execSync } = require("node:child_process");
const path = require("node:path");

// Regenerates packages/theme's outputs (including the widget's colorset Contents.json)
// before @bacons/apple-targets touches Assets.xcassets — those files are gitignored and
// only ever exist because this runs on every `expo prebuild`.
const withThemeCodegen = (config) =>
  withDangerousMod(config, [
    "ios",
    (config) => {
      execSync("bun run codegen", {
        cwd: path.join(config.modRequest.projectRoot, "..", "..", "packages", "theme"),
        stdio: "inherit",
      });
      return config;
    },
  ]);

module.exports = withThemeCodegen;
