module.exports = (config) => ({
  type: "widget",
  name: "PositionsWidget",
  bundleIdentifier: ".widget",
  deploymentTarget: "18.0",
  frameworks: ["SwiftUI", "WidgetKit", "AppIntents"],
  entitlements: {
    "com.apple.security.application-groups": ["group.com.depthly.app.shared"],
  },
  resources: [
    "../../assets/fonts/Satoshi-Regular.otf",
    "../../assets/fonts/Satoshi-Medium.otf",
    "../../assets/fonts/Satoshi-Bold.otf",
    "../../assets/fonts/Satoshi-Black.otf",
  ],
  colors: {},
});
