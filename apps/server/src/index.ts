const server = Bun.serve({
  port: 3000,
  fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response("OK", { status: 200 });
    }

    return new Response("Hello from Bun server!", { status: 200 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
