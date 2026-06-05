import { buildPositionSchema } from "shared/contracts";

import { protocolRegistry } from "../../../app/protocols/registry";

export const positionSchema = buildPositionSchema(protocolRegistry.all().map((entry) => entry.extensionSchema));
