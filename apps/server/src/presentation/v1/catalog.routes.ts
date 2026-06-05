import "reflect-metadata";

import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import { type CatalogResponse, catalogResponseSchema, errorResponseSchema } from "shared/contracts";

import { networkCatalog } from "../../app/networks/catalog";
import { protocolRegistry } from "../../app/protocols/registry";

export const catalogRoutes = new Hono();

catalogRoutes.get(
  "/",
  describeRoute({
    tags: ["Catalog"],
    summary: "Networks and protocols catalog",
    description: "Authoritative list of networks the backend knows about and protocols it supports.",
    responses: {
      200: {
        description: "Catalog",
        content: {
          "application/json": {
            schema: resolver(catalogResponseSchema),
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  }),
  (c) => {
    const protocols = protocolRegistry.all().map((entry) => ({
      slug: entry.slug,
      name: entry.slug,
      version: entry.version,
      supportedChainIds: entry.supportedChainIds,
      capabilities: entry.capabilities,
      extensionVersion: entry.extensionVersion,
    }));

    const body: CatalogResponse = {
      networks: networkCatalog,
      protocols,
    };

    return c.json(body);
  },
);
