import * as Effect from "effect/Effect";
import * as Queue from "effect/Queue";
import * as Stream from "effect/Stream";

export const make = Effect.fn("@usirin/platform-studio/BufferedStream")(function* <T>() {
	const queue = yield* Queue.unbounded<T>();
	const stream = Stream.fromQueue(queue);

	return {stream, queue};
});
