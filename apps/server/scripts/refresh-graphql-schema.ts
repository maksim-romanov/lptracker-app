import { getIntrospectionQuery } from "graphql";

import { writeFile } from "node:fs/promises";

const SCHEMA_URL = "https://api.studio.thegraph.com/query/120331/uniswap-v-3-graph/v0.1.1";
const OUTPUT_PATH = new URL("../schema.introspection.json", import.meta.url).pathname;

const response = await fetch(SCHEMA_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...(Bun.env.GRAPH_API_KEY ? { Authorization: `Bearer ${Bun.env.GRAPH_API_KEY}` } : {}),
  },
  body: JSON.stringify({ query: getIntrospectionQuery() }),
});

if (!response.ok) {
  throw new Error(`Introspection failed: ${response.status} ${await response.text()}`);
}

const payload = (await response.json()) as { data?: unknown; errors?: unknown };
if (payload.errors || !payload.data) {
  throw new Error(`Introspection returned errors: ${JSON.stringify(payload.errors)}`);
}

await writeFile(OUTPUT_PATH, `${JSON.stringify(payload.data, null, 2)}\n`);
console.log(`Wrote ${OUTPUT_PATH}`);
