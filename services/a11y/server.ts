import {serve} from "bun";
import {createJsonRpcServer} from "./lib/server";
import type {RpcMethods} from "./lib/types";

// Implement your RPC methods
const methods: RpcMethods = {
	add: (a, b) => a + b,
	subtract: (a, b) => a - b,
	multiply: (a, b) => a * b,
	divide: (a, b) => {
		if (b === 0) throw new Error("Division by zero");
		return a / b;
	},
};

// Create the JSON-RPC request handler
const handleRequest = createJsonRpcServer(methods);

// Use Bun's serve function with our request handler
const server = serve({
	port: 3000,
	fetch: handleRequest,
});

console.log(`JSON-RPC server is running on http://localhost:${server.port}`);
