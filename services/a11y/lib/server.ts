import type {
	JsonRpcErrorResponse,
	JsonRpcRequest,
	JsonRpcSuccessResponse,
	RpcMethod,
} from "./types";

type JsonRpcHandler = (request: Request) => Promise<Response>;

// biome-ignore lint/suspicious/noExplicitAny: we know that the RpcMethods generic is a Record<string, (...args: any[]) => any>
export function createJsonRpcServer<T extends Record<string, RpcMethod<any, any>>>(
	methods: T,
): JsonRpcHandler {
	return async (request: Request): Promise<Response> => {
		if (request.method !== "POST") {
			return new Response("JSON-RPC server is running. Send POST requests to use the API.", {
				status: 200,
			});
		}

		let body: JsonRpcRequest<unknown[]>;
		try {
			body = await request.json();
		} catch (error) {
			return createErrorResponse("", -32700, "Parse error");
		}

		if (body.jsonrpc !== "2.0") {
			return createErrorResponse(body.id, -32600, "Invalid JSON-RPC version");
		}

		const method = methods[body.method as keyof T];
		if (!method) {
			return createErrorResponse(body.id, -32601, "Method not found");
		}

		try {
			// @ts-ignore
			const result = await method(...body.params);
			return createSuccessResponse(body.id, result);
		} catch (error) {
			return createErrorResponse(body.id, -32000, (error as Error).message);
		}
	};
}

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
