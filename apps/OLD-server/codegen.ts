import type { CodegenConfig } from "@graphql-codegen/cli";

import { GRAPH_API_URL } from "./src/constants";

const config: CodegenConfig = {
  schema: {
    [GRAPH_API_URL]: {
      headers: {
        Authorization: `Bearer ${process.env.GRAPH_API_KEY}`,
      },
    },
  },
  documents: ["src/**/*.ts"],
  generates: {
    "./src/gql/": {
      preset: "client",
      config: {
        documentMode: "string",
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
