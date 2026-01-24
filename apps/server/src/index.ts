import "reflect-metadata";

import { Hono } from "hono";

import { errorHandler } from "./middleware/error-handler";
import { positionsRoute } from "./routes/v1/positions.route";

const app = new Hono();

// Global error handler
app.onError(errorHandler);

// Health check endpoint
app.get("/health", (c) => c.text("OK", 200));

// API v1 routes
app.route("/api/v1/positions", positionsRoute);

// 404 handler
app.notFound((c) => c.json({ error: "Not found" }, 404));

// Export for Bun.serve
export default {
  port: 3000,
  fetch: app.fetch,
};

console.log("Server running at http://localhost:3000");
