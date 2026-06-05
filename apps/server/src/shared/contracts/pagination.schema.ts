import * as v from "valibot";

export const pageSchema = v.pipe(
  v.object({
    cursor: v.nullable(v.string()),
    limit: v.number(),
  }),
  v.metadata({ ref: "Page" }),
);

export type Page = v.InferOutput<typeof pageSchema>;

export type Cursor = { offset: number };

export const encodeCursor = (cursor: Cursor): string => Buffer.from(JSON.stringify(cursor), "utf-8").toString("base64url");

export const decodeCursor = (encoded: string): Cursor | null => {
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
    if (typeof parsed?.offset !== "number" || parsed.offset < 0) return null;
    return { offset: parsed.offset };
  } catch {
    return null;
  }
};
