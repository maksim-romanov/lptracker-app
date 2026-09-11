import { mapV3Error } from "../error-mapper";
import { describe, expect, it } from "bun:test";
import { PositionError } from "#features/uniswap-v3/domain/errors/position.error";
import { DomainError } from "#shared/errors/base.error";

class ForeignError extends DomainError {}

describe("mapV3Error", () => {
  it("maps POSITION_NOT_FOUND to a 404", () => {
    const mapped = mapV3Error(PositionError.POSITION_NOT_FOUND());
    expect(mapped).toEqual({ status: 404, code: "POSITION_NOT_FOUND", message: "Position not found" });
  });

  it("maps GRAPHQL_ERROR to a 502 UPSTREAM_UNAVAILABLE", () => {
    const mapped = mapV3Error(PositionError.GRAPHQL_ERROR({ message: "boom" }));
    expect(mapped?.status).toBe(502);
    expect(mapped?.code).toBe("UPSTREAM_UNAVAILABLE");
  });

  it("maps UNEXPECTED_ERROR to a 500", () => {
    expect(mapV3Error(PositionError.UNEXPECTED_ERROR())?.status).toBe(500);
  });

  it("declines an error raised by another protocol", () => {
    expect(mapV3Error(new ForeignError("SOMETHING_ELSE", "not ours"))).toBeUndefined();
  });
});
