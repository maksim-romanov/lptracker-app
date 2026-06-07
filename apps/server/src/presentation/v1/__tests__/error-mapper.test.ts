import "reflect-metadata";

import type { DomainError } from "shared/errors/base.error";
import { PositionError } from "uniswap-v3/domain/errors/position.error";

import { mapDomainErrorToResponse } from "../error-mapper";
import { describe, expect, it } from "bun:test";

describe("v1 error-mapper (registry-driven)", () => {
  it("maps a V3 POSITION_NOT_FOUND via the V3 ProtocolEntry.mapError hook", () => {
    const err = PositionError.POSITION_NOT_FOUND();
    const mapped = mapDomainErrorToResponse(err);
    expect(mapped.status).toBe(404);
    expect(mapped.body.error.code).toBe("POSITION_NOT_FOUND");
    expect(mapped.body.error.message).toBe("Position not found");
  });

  it("maps a V3 GRAPHQL_ERROR to 502 UPSTREAM_UNAVAILABLE via the registry hook", () => {
    const err = PositionError.GRAPHQL_ERROR({ message: "boom" });
    const mapped = mapDomainErrorToResponse(err);
    expect(mapped.status).toBe(502);
    expect(mapped.body.error.code).toBe("UPSTREAM_UNAVAILABLE");
  });

  it("returns generic 500 for an unmapped DomainError", () => {
    class UnknownError extends Error {
      readonly code = "UNKNOWN";
    }
    const mapped = mapDomainErrorToResponse(new UnknownError() as unknown as DomainError);
    expect(mapped.status).toBe(500);
    expect(mapped.body.error.code).toBe("INTERNAL_ERROR");
  });
});
