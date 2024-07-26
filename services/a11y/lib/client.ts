import type {JsonRpcRequest, JsonRpcResponse, RpcMethods} from "./types";

export class JsonRpcClient {
	private url: string;
	private nextId = 1;

	constructor(url: string) {
		this.url = url;
	}

	async call<M extends keyof RpcMethods>(
		method: M,
		...params: Parameters<RpcMethods[M]>
	): Promise<ReturnType<RpcMethods[M]>> {
		const request: JsonRpcRequest<Parameters<RpcMethods[M]>> = {
			jsonrpc: "2.0",
			method,
			params,
			id: this.nextId++,
		};

		const response = await fetch(this.url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(request),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const jsonResponse: JsonRpcResponse<ReturnType<RpcMethods[M]>> = await response.json();

		if ("error" in jsonResponse) {
			throw new Error(`RPC error: ${jsonResponse.error.message}`);
		}

		return jsonResponse.result;
	}
}
