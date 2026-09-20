import type { InferOutput, ObjectSchema } from "valibot";

import type { Position, positionBaseShape } from "../position.schema";

type Identical<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

type PositionBase = InferOutput<ObjectSchema<typeof positionBaseShape, undefined>>;

// Fails to compile when the hand-written interface and the schema that produces the wire
// format disagree. `extension` is excluded because the interface holds a union the schema
// builds at runtime from the registry.
const _positionMatchesSchema: Identical<Omit<Position, "extension">, PositionBase> = true;
