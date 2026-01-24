import type { Context } from "hono";
import { Hono } from "hono";
import { container } from "../../di/container";
import { classValidator, getValidated } from "../../middleware/validator";
import { GetPositionsQueryDto } from "../../dto/get-positions.dto";
import { GetPositionByIdParamDto } from "../../dto/get-position-by-id.dto";
import { GetPositionFeesParamDto } from "../../dto/get-position-fees.dto";
import { GetWalletPositionsUseCase } from "../../features/uniswap-v3/application/usecases/get-wallet-positions.usecase";
import { GetPositionByIdUseCase } from "../../features/uniswap-v3/application/usecases/get-position-by-id.usecase";
import { GetPositionFeesUseCase } from "../../features/uniswap-v3/application/usecases/get-position-fees.usecase";
import { OrderDirection, Position_OrderBy } from "../../gql/graphql";

export const positionsRoute = new Hono();

/**
 * GET /api/v1/positions
 * Fetch wallet positions with pagination, filtering, and optional detail level
 */
positionsRoute.get("/", classValidator("query", GetPositionsQueryDto), async (c: Context) => {
	const query = getValidated<GetPositionsQueryDto>(c, "query");

	const useCase = container.resolve(GetWalletPositionsUseCase);
	const result = await useCase.execute({
		owner: query.owner,
		first: query.first ?? 50,
		skip: query.skip ?? 0,
		closed: query.closed ?? false,
		orderBy: query.orderBy ?? Position_OrderBy.CreatedAtTimestamp,
		orderDirection: query.orderDirection ?? OrderDirection.Desc,
		detail: query.detail ?? "basic",
	});

	if (result.isErr()) {
		const error = result.error;
		if (error.code === "INVALID_ADDRESS") {
			return c.json({ error: error.message }, 400);
		}
		return c.json({ error: error.message }, 500);
	}

	return c.json(result.value);
});

/**
 * GET /api/v1/positions/:id/fees
 * Fetch unclaimed fees for a specific position
 * IMPORTANT: This route must come before /:id to avoid route conflicts
 */
positionsRoute.get("/:id/fees", classValidator("param", GetPositionFeesParamDto), async (c: Context) => {
	const params = getValidated<GetPositionFeesParamDto>(c, "param");

	const useCase = container.resolve(GetPositionFeesUseCase);
	const result = await useCase.execute(params.id);

	if (result.isErr()) {
		const error = result.error;
		if (error.isNotFound) {
			return c.json({ error: error.message }, 404);
		}
		return c.json({ error: error.message }, 500);
	}

	return c.json(result.value);
});

/**
 * GET /api/v1/positions/:id
 * Fetch a specific position by ID with full details
 */
positionsRoute.get("/:id", classValidator("param", GetPositionByIdParamDto), async (c: Context) => {
	const params = getValidated<GetPositionByIdParamDto>(c, "param");

	const useCase = container.resolve(GetPositionByIdUseCase);
	const result = await useCase.execute(params.id);

	if (result.isErr()) {
		const error = result.error;
		if (error.isNotFound) {
			return c.json({ error: error.message }, 404);
		}
		return c.json({ error: error.message }, 500);
	}

	return c.json(result.value);
});
