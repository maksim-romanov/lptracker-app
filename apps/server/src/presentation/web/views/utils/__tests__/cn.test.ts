import { cn } from "../cn";
import { describe, expect, test } from "bun:test";

describe("cn", () => {
  test("a type role and a colour are different groups and both survive", () => {
    expect(cn("text-button", "text-on-primary")).toBe("text-button text-on-primary");
    expect(cn("text-on-surface-variant", "text-label")).toBe("text-on-surface-variant text-label");
  });

  test("a type role replaces another type role and Tailwind's own sizes", () => {
    expect(cn("text-body", "text-caption")).toBe("text-caption");
    expect(cn("text-sm", "text-figure-small")).toBe("text-figure-small");
    expect(cn("text-headline", "text-lg")).toBe("text-lg");
  });

  test("ordinary conflicts still resolve last-wins", () => {
    expect(cn("rounded-sm", "rounded-full")).toBe("rounded-full");
    expect(cn("border-outline", "border-transparent")).toBe("border-transparent");
  });
});
