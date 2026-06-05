import openapiTS, { astToString } from "openapi-typescript";

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TOKENS_DATA_SPEC = join(import.meta.dir, "..", "..", "tokens-data", "generated", "openapi.json");
const OUTPUT = join(import.meta.dir, "..", "src", "shared", "clients", "tokens-data", "generated.ts");

async function generateTokensDataTypes() {
  const spec = JSON.parse(readFileSync(TOKENS_DATA_SPEC, "utf-8"));
  const ast = await openapiTS(spec);
  writeFileSync(OUTPUT, astToString(ast));
  console.log(`Generated: ${OUTPUT}`);
}

generateTokensDataTypes().catch(console.error);
