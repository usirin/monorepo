import {JsonRpcClient} from "./lib/client";
import type {RpcMethods} from "./server";

async function main() {
	const serverUrl = process.env.RPC_SERVER_URL || "http://localhost:3000";
	const client = new JsonRpcClient<RpcMethods>(serverUrl);

	try {
		console.log("Addition:", await client.call("add", 5, 3));
		console.log("Subtraction:", await client.call("subtract", 10, 4));
		console.log("Multiplication:", await client.call("multiply", 7, 6));
		console.log("Division:", await client.call("divide", 15, 3));

		// This should throw an error
		await client.call("multiply", 10, 0);
	} catch (error) {
		console.error("An error occurred:", (error as Error).message);
	}
}

main();
