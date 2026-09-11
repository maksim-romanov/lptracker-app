import "reflect-metadata";

import { mapDomainErrorToResponse } from "../error-mapper";
import { describe, expect, it } from "bun:test";
import { PositionError } from "#features/uniswap-v3/domain/errors/position.error";
import { DomainError } from "#shared/errors/base.error";

class UnclaimedError extends DomainError {}

describe("v1 error-mapper (registry-driven)", () => {
  it("maps a real protocol error to a real HTTP body through the registered hooks", () => {
    const mapped = mapDomainErrorToResponse(PositionError.POSITION_NOT_FOUND());
    expect(mapped.status).toBe(404);
    expect(mapped.body.error.code).toBe("POSITION_NOT_FOUND");
    expect(mapped.body.error.message).toBe("Position not found");
    expect(mapped.body.error.field).toBeNull();
  });

  it("keeps a second real code distinct, so the hook is consulted rather than a 404 assumed", () => {
    const mapped = mapDomainErrorToResponse(PositionError.GRAPHQL_ERROR({ message: "boom" }));
    expect(mapped.status).toBe(502);
    expect(mapped.body.error.code).toBe("UPSTREAM_UNAVAILABLE");
  });

  it("returns generic 500 when no registered protocol claims the error", () => {
    const mapped = mapDomainErrorToResponse(new UnclaimedError("UNKNOWN", "boom"));
    expect(mapped.status).toBe(500);
    expect(mapped.body.error.code).toBe("INTERNAL_ERROR");
  });
});
