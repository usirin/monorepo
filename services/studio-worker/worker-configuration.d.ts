// Generated by Wrangler by running `wrangler types`

interface Env {
	MY_DURABLE_OBJECT: DurableObjectNamespace<import("./src/index").MyDurableObject>;
	DISPATCHER: DurableObjectNamespace<import("./src/index").Dispatcher>;
}
