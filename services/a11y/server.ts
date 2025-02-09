import {serve} from "bun";
import {createJsonRpcServer} from "./lib/server";

// Define the structure of our RPC methods

// Implement your RPC methods
const methods = {
	add: (a: number, b: number) => a + b,
	subtract: (a: number, b: number) => a - b,
	multiply: (a: number, b: number) => a * b,
	divide: (a: number, b: number) => {
		if (b === 0) throw new Error("Division by zero");
		return a / b;
	},
	ping: () => "pong",
};

export type RpcMethods = typeof methods;

// Create the JSON-RPC request handler
const handleRequest = createJsonRpcServer(methods);

// Use Bun's serve function with our request handler
const server = serve({
	port: process.env.PORT || 3000,
	fetch: handleRequest,
});

console.log(`JSON-RPC server is running on http://localhost:${server.port}`);
