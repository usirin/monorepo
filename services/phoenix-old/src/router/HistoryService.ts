/**
 * HistoryService - Effect wrapper around browser history API with streaming
 */

import {Effect, Queue, Stream} from "effect";
import {type Action, createBrowserHistory, type Location} from "history";

export interface LocationChange {
	location: Location;
	action: Action;
}

export class HistoryService extends Effect.Service<HistoryService>()("sixtysix/HistoryService", {
	effect: Effect.gen(function* () {
		const history = createBrowserHistory();

		// Create a queue for location changes
		const locationQueue = yield* Queue.unbounded<LocationChange>();

		const push = (path: string) => Effect.sync(() => history.push(path));

		const replace = (path: string) => Effect.sync(() => history.replace(path));

		const getCurrentLocation = () => Effect.sync(() => history.location);

		// Create a stream of location changes
		const locationStream = Stream.fromQueue(locationQueue);

		// Start listening to history changes and feeding the queue
		const startListening = Effect.gen(function* () {
			const unlisten = history.listen(({location, action}) => {
				// Feed location changes into the queue
				Effect.runFork(Queue.offer(locationQueue, {location, action}));
			});

			// Return cleanup function
			return Effect.sync(() => unlisten());
		});

		return {
			history,
			push,
			replace,
			getCurrentLocation,
			locationStream,
			startListening,
		} as const;
	}),
}) {}
