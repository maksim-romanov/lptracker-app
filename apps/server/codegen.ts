import type { CodegenConfig } from "@graphql-codegen/cli";

interface FeatureConfig {
  schema: string;
}

const featureConfigs: Record<string, FeatureConfig> = {
  "uniswap-v3": {
    schema: "./schema.introspection.json",
  },
};

type FeatureName = keyof typeof featureConfigs;

const createFeatureConfig = (feature: FeatureName): CodegenConfig["generates"] => {
  const config = featureConfigs[feature];
  if (!config) throw new Error(`Unknown feature: ${feature}`);
  const { schema } = config;

  return {
    [`./src/features/${feature}/data/gql/`]: {
      schema,
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
