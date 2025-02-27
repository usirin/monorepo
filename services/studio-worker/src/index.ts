export {Dispatcher} from "./dispatcher";

import {Hono} from "hono";
const app = new Hono<{Bindings: Env}>();

app.get("/ws", async (c) => {
	const request = c.req.raw;
	const upgradeHeader = request.headers.get("Upgrade");
	if (!upgradeHeader || upgradeHeader !== "websocket") {
		return new Response(null, {
			status: 426,
			statusText: "Durable Object expected Upgrade: websocket",
			headers: {
				"Content-Type": "text/plain",
			},
		});
	}

	// This example will refer to a single Durable Object instance, since the name "foo" is
	// hardcoded
	const id = c.env.DISPATCHER.idFromName("foo");
	const stub = c.env.DISPATCHER.get(id);

	// The Durable Object's fetch handler will accept the server side connection and return
	// the client
	return stub.fetch(request);
});

app.get("/", async () => {
	return new Response("Hello, World!", {status: 200});
});

export default app;
