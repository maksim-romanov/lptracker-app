import type { Context } from "hono";
import { Hono } from "hono";

import { getPositionFeesLogic } from "../../api/v1/positions/fees";
import { getPositionLogic } from "../../api/v1/positions/id";
import { getWalletPositionsLogic } from "../../api/v1/positions/index";
import { GetPositionByIdParamDto } from "../../dto/get-position-by-id.dto";
import { GetPositionFeesParamDto } from "../../dto/get-position-fees.dto";
import { GetPositionsQueryDto } from "../../dto/get-positions.dto";
import { classValidator, getValidated } from "../../middleware/validator";

export const positionsRoute = new Hono();

/**
 * GET /api/v1/positions
 * Fetch wallet positions with pagination, filtering, and optional detail level
 */
positionsRoute.get("/", classValidator("query", GetPositionsQueryDto), async (c: Context) => {
  try {
    const query = getValidated<GetPositionsQueryDto>(c, "query");

    const data = await getWalletPositionsLogic({
      owner: query.owner,
      first: query.first ?? 50,
      skip: query.skip ?? 0,
      closed: query.closed ?? false,
      orderBy: query.orderBy ?? "createdAtTimestamp",
      orderDirection: query.orderDirection ?? "desc",
      detail: query.detail ?? "basic",
    });

    return c.json(data);
  } catch (error) {
    console.error("Failed to fetch wallet positions:", error);
    return c.json({ error: "Failed to fetch positions" }, 500);
  }
});

/**
 * GET /api/v1/positions/:id/fees
 * Fetch unclaimed fees for a specific position
 * IMPORTANT: This route must come before /:id to avoid route conflicts
 */
positionsRoute.get("/:id/fees", classValidator("param", GetPositionFeesParamDto), async (c: Context) => {
  try {
    const params = getValidated<GetPositionFeesParamDto>(c, "param");
    const data = await getPositionFeesLogic(params.id);
    return c.json(data);
  } catch (error: any) {
    console.error("Failed to fetch position fees:", error);
    if (error.status === 404) {
      return c.json({ error: error.message }, 404);
    }
    return c.json({ error: error.message || "Failed to fetch position fees" }, error.status || 500);
  }
});

/**
 * GET /api/v1/positions/:id
 * Fetch a specific position by ID with full details
 */
positionsRoute.get("/:id", classValidator("param", GetPositionByIdParamDto), async (c: Context) => {
  try {
    const params = getValidated<GetPositionByIdParamDto>(c, "param");
    const data = await getPositionLogic(params.id);
    return c.json(data);
  } catch (error: any) {
    console.error("Failed to fetch position:", error);
    if (error.status === 404) {
      return c.json({ error: error.message }, 404);
    }
    return c.json({ error: error.message || "Failed to fetch position" }, error.status || 500);
  }
});
