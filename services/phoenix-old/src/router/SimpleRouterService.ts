/**
 * Simplified RouterService implementation
 */

import {Effect, Fiber, Ref, Stream, SubscriptionRef} from "effect";
import {HistoryService, type LocationChange} from "./HistoryService.js";
import {matchPath} from "./matching.js";
import type {SimpleMatchResult, SimpleRouteHandler, SimpleRouteRegistry} from "./simple-types.js";

export class SimpleRouterService extends Effect.Service<SimpleRouterService>()(
	"sixtysix/SimpleRouterService",
	{
		effect: Effect.gen(function* () {
			const historyService = yield* HistoryService;
			const currentRoute = yield* SubscriptionRef.make<SimpleMatchResult | null>(null);
			const routeRegistry = yield* Ref.make<SimpleRouteRegistry>({});

			const addRoute = (path: string, handler: SimpleRouteHandler) =>
				Ref.update(routeRegistry, (routes) => ({...routes, [path]: handler}));

			const matchRoute = (url: string) =>
				Effect.gen(function* () {
					const routes = yield* Ref.get(routeRegistry);

					for (const [pattern, handler] of Object.entries(routes)) {
						const match = matchPath(pattern, url);
						if (match) {
							return {
								handler,
								params: match.params,
								query: match.query,
							} as SimpleMatchResult;
						}
					}
					return null;
				});

			const navigate = (path: string) =>
				Effect.gen(function* () {
					yield* historyService.push(path);
					const matchResult = yield* matchRoute(path);
					yield* SubscriptionRef.set(currentRoute, matchResult);
				}).pipe(Effect.withSpan("router.navigate", {attributes: {path}}));

			// Stream-based route updates
			const routeUpdatesStream = historyService.locationStream.pipe(
				Stream.map((change: LocationChange) => change.location.pathname + change.location.search),
				Stream.map((url: string) => matchRoute(url)),
				Stream.mapEffect((effect) => effect),
			);

			const initialize = Effect.gen(function* () {
				// Set initial route
				const location = yield* historyService.getCurrentLocation();
				const matchResult = yield* matchRoute(location.pathname + location.search);
				yield* SubscriptionRef.set(currentRoute, matchResult);

				// Start history listening
				const cleanup = yield* historyService.startListening;

				// Start consuming the route updates stream
				const routeUpdatesFiber = yield* Stream.runForEach(routeUpdatesStream, (matchResult) =>
					SubscriptionRef.set(currentRoute, matchResult),
				).pipe(Effect.fork);

				// Return cleanup that stops both history listening and stream processing
				return Effect.gen(function* () {
					yield* cleanup;
					yield* Fiber.interrupt(routeUpdatesFiber);
				});
			});

			return {
				addRoute,
				matchRoute,
				navigate,
				currentRoute,
				initialize,
			} as const;
		}),
		dependencies: [HistoryService.Default],
	},
) {}
