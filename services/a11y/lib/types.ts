// types.ts

export type JsonRpcVersion = "2.0";

export interface JsonRpcRequest<T extends unknown[]> {
	jsonrpc: JsonRpcVersion;
	method: string;
	params: T;
	id: number | string;
}

export interface JsonRpcSuccessResponse<T> {
	jsonrpc: JsonRpcVersion;
	result: T;
	id: number | string;
}

export interface JsonRpcErrorResponse {
	jsonrpc: JsonRpcVersion;
	error: {
		code: number;
		message: string;
	};
	id: number | string;
}

export type JsonRpcResponse<T> = JsonRpcSuccessResponse<T> | JsonRpcErrorResponse;

export type RpcMethod<T extends unknown[], R> = (...params: T) => R;

// Define the structure of our RPC methods
export interface RpcMethods {
	add: RpcMethod<[number, number], number>;
	subtract: RpcMethod<[number, number], number>;
	multiply: RpcMethod<[number, number], number>;
	divide: RpcMethod<[number, number], number>;
}
