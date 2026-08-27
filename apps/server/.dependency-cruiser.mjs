/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Circular imports make load order significant and break tree-shaking.",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-unresolvable",
      severity: "error",
      comment: "A specifier that resolves to nothing is a typo or a missing package.json#imports key.",
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: "cross-layer-needs-subpath-import",
      severity: "error",
      comment:
        "Leaving app/, features/ or shared/ must go through a #-prefixed subpath import. " +
        "Editors auto-write relative specifiers, so without this rule the convention decays. " +
        "See docs/architecture.md.",
      from: { path: "^src/([^/]+)/" },
      to: {
        path: "^src/(app|features|shared)/",
        pathNot: "^src/$1/",
        dependencyTypesNot: ["aliased-subpath-import"],
      },
    },
    {
      name: "features-are-isolated",
      severity: "error",
      comment: "One feature must not reach into another — aggregate them in app/ instead.",
      from: { path: "^src/features/([^/]+)/" },
      to: { path: "^src/features/([^/]+)/", pathNot: "^src/features/$1/" },
    },
    {
      name: "domain-is-pure",
      severity: "error",
      comment: "domain/ is the innermost layer: no data/, app/, presentation/ or di/ below it.",
      from: { path: "^src/features/[^/]+/domain/" },
      to: { path: "^src/features/[^/]+/(data|app|presentation|di)/" },
    },
    {
      name: "data-does-not-know-callers",
      severity: "error",
      comment: "data/ may use domain/ only — it must not reach up into app/ or presentation/.",
      from: { path: "^src/features/[^/]+/data/" },
      to: { path: "^src/features/[^/]+/(app|presentation)/" },
    },
    {
      name: "app-does-not-know-transport",
      severity: "error",
      comment:
        "Use cases must not depend on HTTP. presentation/schemas/ is the exception: it holds the " +
        "feature's contract shape (Valibot + OpenAPI metadata), which app/ and the gateway both " +
        "consume by design — see the slice description in CLAUDE.md.",
      from: { path: "^src/features/[^/]+/app/" },
      to: {
        path: "^src/features/[^/]+/presentation/",
        pathNot: "^src/features/[^/]+/presentation/schemas/",
      },
    },
    {
      name: "shared-is-generic",
      severity: "error",
      comment: "shared/ is the base layer — it cannot depend on a feature or on the gateway.",
      from: { path: "^src/shared/" },
      to: { path: "^src/(app|features|presentation)/" },
    },
    {
      name: "not-to-dev-dep",
      severity: "error",
      comment: "Runtime code must not import a devDependency.",
      from: {
        path: "^src/",
        pathNot: [
          "[.](?:spec|test|stories)[.]tsx?$",
          "^src/.*/__tests__/",
          // Bundled into the client asset by build-assets.ts — never resolved at server runtime,
          // so stimulus/htmx/mipd are correctly devDependencies.
          "^src/presentation/web/client/",
          "[.]d[.]ts$",
        ],
      },
      to: {
        dependencyTypes: ["npm-dev"],
        dependencyTypesNot: ["type-only"],
        // `import { redis } from "bun"` is a runtime builtin; it only resolves via @types/bun.
        pathNot: "node_modules/@types/bun/",
      },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "^src/features/uniswap-v3/data/gql/" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "types", "default"],
      mainFields: ["module", "main", "types", "typings"],
      extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"],
    },
  },
};
