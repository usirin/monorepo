/**
 * RouterService - Core Effect-based router service
 */

import {Effect, Ref, SubscriptionRef} from "effect";
import {HistoryService} from "./HistoryService.js";
import {matchPath} from "./matching.js";
import type {MatchResult, RouteHandler, RouteRegistry} from "./types.js";

export class RouterService extends Effect.Service<RouterService>()("sixtysix/RouterService", {
	effect: Effect.gen(function* () {
		const historyService = yield* HistoryService;
		const currentRoute = yield* SubscriptionRef.make<MatchResult | null>(null);

		// Route registry - can be updated dynamically
		const routeRegistry = yield* Ref.make<RouteRegistry>({});

		const addRoute = (path: string, handler: RouteHandler) =>
			Ref.update(routeRegistry, (routes) => ({...routes, [path]: handler}));

		const matchRoute = (url: string) =>
			Effect.gen(function* () {
				const routes = yield* Ref.get(routeRegistry);

				// Path-to-regexp based matching with parameter extraction
				for (const [pattern, handler] of Object.entries(routes)) {
					const match = matchPath(pattern, url);
					if (match) {
						return {
							handler,
							params: match.params,
							query: match.query,
						} as MatchResult;
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

		const getCurrentRoute = () => SubscriptionRef.get(currentRoute);

		// Initialize current route from URL and set up history listener
		const initialize = Effect.gen(function* () {
			// Set initial route from current URL
			const location = yield* historyService.getCurrentLocation();
			const matchResult = yield* matchRoute(location.pathname + location.search);
			yield* SubscriptionRef.set(currentRoute, matchResult);

			// For now, simplified approach without the stream processing
			// TODO: Integrate with locationStream properly
		});

		return {
			addRoute,
			matchRoute,
			navigate,
			getCurrentRoute,
			currentRoute,
			initialize,
		} as const;
	}),
	dependencies: [HistoryService.Default],
}) {}
