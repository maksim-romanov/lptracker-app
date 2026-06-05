import "reflect-metadata";

import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { container } from "tsyringe";

import { ResolveLogoUseCase } from "../../app/resolve-logo.usecase";
import { type LogoParams, logoParamsSchema } from "../schemas/request.schemas";

export const routes = new Hono();

routes.get(
  "/chains/:chainId/tokens/:address/logo.png",
  describeRoute({
    tags: ["Tokens Meta"],
    summary: "Get token logo",
    description: "Resolves and redirects to the token logo image URL",
    responses: {
      302: { description: "Redirect to logo URL" },
      404: { description: "Logo not found" },
    },
  }),
  validator("param", logoParamsSchema),
  async (c) => {
    const { chainId, address } = c.req.valid("param") as LogoParams;

    const result = await container.resolve(ResolveLogoUseCase).execute(chainId, address);

    if (result.isErr()) {
      return c.notFound();
    }

    return c.redirect(result.value, 302);
  },
);
