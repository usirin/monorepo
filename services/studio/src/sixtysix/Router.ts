import {Context, Data, Effect, Layer, Stream} from "effect";
import type * as Radix3 from "radix3";

interface RouteData {
	_tag: "RouteData";
	handler: (res: Radix3.MatchedRoute<RouteData>) => void;
}

export class RouterError<Method extends string> extends Data.TaggedError("RouterError")<{
	method: Method;
	cause: unknown;
}> {}

export interface RouterApi {
	client: Radix3.RadixRouter<RouteData>;
	insert: (path: string, data: RouteData) => Effect.Effect<void, RouterError<"Router.insert">>;
	remove: (path: string) => Effect.Effect<void, RouterError<"Router.remove">>;
	lookup: (
		path: string,
	) => Effect.Effect<Radix3.MatchedRoute<RouteData> | null, RouterError<"Router.lookup">>;
}

export class Router extends Context.Tag("Router")<Router, RouterApi>() {}

export const layer = (f: () => Radix3.RadixRouter<RouteData>) => {
	const client = f();

	return Layer.effect(
		Router,
		Effect.gen(function* () {
			yield* Effect.log("creating router layer");

			return {
				client,
				insert: (path, data) =>
					Effect.try({
						try: () => client.insert(path, data),
						catch: (cause) => new RouterError({method: "Router.insert", cause}),
					}),
				remove: (path: string) =>
					Effect.try({
						try: () => client.remove(path),
						catch: (cause) => new RouterError({method: "Router.remove", cause}),
					}),
				lookup: (path: string) =>
					Effect.try({
						try: () => client.lookup(path),
						catch: (cause) => new RouterError({method: "Router.lookup", cause}),
					}),
			};
		}),
	);
};
