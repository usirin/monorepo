/**
 * JSON-RPC 2.0 Server Implementation
 *
 * This module provides a type-safe implementation of a JSON-RPC 2.0 server using the Web Fetch API.
 * It handles incoming JSON-RPC requests, validates them according to the specification, and returns
 * appropriate responses.
 *
 * Features:
 * - Full JSON-RPC 2.0 specification compliance
 * - Type-safe method handling through TypeScript generics
 * - Automatic error handling and response formatting
 * - Support for both synchronous and asynchronous methods
 *
 * @see {@link https://www.jsonrpc.org/specification} JSON-RPC 2.0 Specification
 */

import type {
	JsonRpcErrorResponse,
	JsonRpcRequest,
	JsonRpcSuccessResponse,
	RpcMethod,
} from "./types";

type JsonRpcHandler = (request: Request) => Promise<Response>;

/**
 * Creates a JSON-RPC 2.0 compliant server handler with typed methods.
 *
 * @template T - A record of method names to their corresponding function signatures
 * @param methods - An object mapping method names to their implementations
 * @returns A request handler function that processes JSON-RPC requests
 *
 * @example
 * const server = createJsonRpcServer({
 *   add: (a: number, b: number) => a + b,
 *   echo: (message: string) => message,
 * });
 */
export function createJsonRpcServer<T extends Record<string, RpcMethod<any, any>>>(
	methods: T,
): JsonRpcHandler {
	return async (request: Request): Promise<Response> => {
		// Handle non-POST requests with a friendly message
		if (request.method !== "POST") {
			return new Response("JSON-RPC server is running. Send POST requests to use the API.", {
				status: 200,
			});
		}

		let body: JsonRpcRequest<unknown[]>;

		// Parse the request body and handle JSON parsing errors
		try {
			body = await request.json();
		} catch (error) {
			// Error code -32700: Parse error (invalid JSON)
			return createErrorResponse("", -32700, "Parse error");
		}

		// Validate JSON-RPC version
		if (body.jsonrpc !== "2.0") {
			// Error code -32600: Invalid Request (not JSON-RPC 2.0)
			return createErrorResponse(body.id, -32600, "Invalid JSON-RPC version");
		}

		// Look up the requested method in our methods map
		const method = methods[body.method as keyof T];
		if (!method) {
			// Error code -32601: Method not found
			return createErrorResponse(body.id, -32601, "Method not found");
		}

		// Execute the method and handle any runtime errors
		try {
			// @ts-ignore - We trust our type system here as methods are typed by T
			const result = await method(...body.params);
			return createSuccessResponse(body.id, result);
		} catch (error) {
			// Error code -32000: Server error (method execution failed)
			return createErrorResponse(body.id, -32000, (error as Error).message);
		}
	};
}

/**
 * Creates a successful JSON-RPC 2.0 response.
 *
 * @template T - The type of the result value
 * @param id - The request ID to correlate the response
 * @param result - The method execution result
 * @returns A Response object with the JSON-RPC success response
 */
function createSuccessResponse<T>(id: number | string, result: T): Response {
	const response: JsonRpcSuccessResponse<T> = {
		jsonrpc: "2.0",
		result,
		id,
	};
	return new Response(JSON.stringify(response), {
		status: 200,
		headers: {"Content-Type": "application/json"},
	});
}

/**
 * Creates an error JSON-RPC 2.0 response.
 *
 * @param id - The request ID to correlate the response
 * @param code - The error code (see JSON-RPC 2.0 spec for standard codes)
 * @param message - A human-readable error message
 * @returns A Response object with the JSON-RPC error response
 */
function createErrorResponse(id: number | string, code: number, message: string): Response {
	const response: JsonRpcErrorResponse = {
		jsonrpc: "2.0",
		error: {code, message},
		id,
	};
	return new Response(JSON.stringify(response), {
		status: 400,
		headers: {"Content-Type": "application/json"},
	});
}
