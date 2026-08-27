import { protocolRegistry } from "#app/protocols/registry";
import { buildPositionSchema } from "#shared/contracts";

export const positionSchema = buildPositionSchema(protocolRegistry.all().map((entry) => entry.extensionSchema));
