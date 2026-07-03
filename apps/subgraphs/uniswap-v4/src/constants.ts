import { Address } from "@graphprotocol/graph-ts";

// Mirrors the PositionManager address in networks.json / subgraph.yaml. The Graph
// cannot inject those config values into WASM, so the handler gate keeps its own copy here.
export let POSITION_MANAGER = Address.fromString("0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e");
