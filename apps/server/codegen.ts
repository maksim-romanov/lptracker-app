import type { CodegenConfig } from "@graphql-codegen/cli";

interface FeatureConfig {
  schema: string;
  headers?: Record<string, string>;
}

const featureConfigs: Record<string, FeatureConfig> = {
  "uniswap-v3": {
    schema: "https://api.studio.thegraph.com/query/120331/uniswap-v-3-graph/v0.0.32",
    headers: {
      Authorization: `Bearer ${process.env.GRAPH_API_KEY}`,
    },
  },
};

type FeatureName = keyof typeof featureConfigs;

const createFeatureConfig = (feature: FeatureName): CodegenConfig["generates"] => {
  const { schema, headers } = featureConfigs[feature]!;

  return {
    [`./src/features/${feature}/data/gql/`]: {
      schema: headers ? { [schema]: { headers } } : schema,
      documents: [`src/features/${feature}/**/*.ts`],
      preset: "client",
      config: {
        documentMode: "string",
      },
    },
  };
};

const generates = Object.keys(featureConfigs).reduce<CodegenConfig["generates"]>(
  (acc, feature) => Object.assign(acc, createFeatureConfig(feature as FeatureName)),
  {},
);

const config: CodegenConfig = {
  generates,
  ignoreNoDocuments: true,
};

export default config;
