import {Chunk, Context, Data, Effect, Layer, Stream} from "effect";
import type * as Api from "history";

export class HistoryError<Method extends string> extends Data.TaggedError("HistoryError")<{
	method: Method;
	cause: unknown;
}> {}

export interface HistoryApi {
	client: Api.History;
	push: <TState extends Record<string, any>>(
		path: Api.To,
		state?: TState,
	) => Effect.Effect<void, HistoryError<"History.push">, never>;
	replace: <TState extends Record<string, any>>(
		path: Api.To,
		state?: TState,
	) => Effect.Effect<void, HistoryError<"History.replace">, never>;
	go: (delta: number) => Effect.Effect<void, HistoryError<"History.go">, never>;
	listen: () => Stream.Stream<Api.Update, never, never>;
}

export class History extends Context.Tag("History")<History, HistoryApi>() {}

export const layer = (f: () => Api.History) => {
	const history = f();

	return Layer.effect(
		History,
		Effect.gen(function* () {
			const stream = Stream.async<Api.Update>((emit) => {
				history.listen((update) => {
					emit(Effect.succeed(Chunk.of(update)));
				});
			});

			console.log(">>> created fal", stream);

			return {
				client: history,
				push: (path, state) =>
					Effect.try({
						try: () => history.push(path, state),
						catch: (cause) => new HistoryError({method: "History.push", cause}),
					}),
				replace: (path, state) =>
					Effect.try({
						try: () => history.replace(path, state),
						catch: (cause) => new HistoryError({method: "History.replace", cause}),
					}),
				go: (delta) =>
					Effect.try({
						try: () => history.go(delta),
						catch: (cause) => new HistoryError({method: "History.go", cause}),
					}),
				listen: () => stream,
			};
		}),
	);
};
