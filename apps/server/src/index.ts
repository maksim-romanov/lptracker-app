import { handleV1Route } from "api/v1";

const server = Bun.serve({
  port: 3000,
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response("OK", { status: 200 });
    }

    const v1Response = handleV1Route(url);
    if (v1Response) return v1Response;

    return Response.json({ error: "Not found" }, { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
