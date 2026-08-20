module.exports = (config) => ({
  type: "widget",
  name: "PositionsWidget",
  bundleIdentifier: ".widget",
  deploymentTarget: "18.0",
  frameworks: ["SwiftUI", "WidgetKit", "AppIntents"],
  entitlements: {
    "com.apple.security.application-groups": ["group.com.depthly.app.shared"],
  },
  // Colorsets are owned by @depthly/theme codegen (see plugins/withThemeCodegen.js) — don't
  // add a `colors` object here, @bacons/apple-targets would overwrite them with display-p3.
});
