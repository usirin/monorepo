/**
 * Simplified React-Effect bridge hooks
 */

import {Effect, Fiber, SubscriptionRef} from "effect";
import {useEffect, useState} from "react";
import {SimpleRouterService} from "../router/SimpleRouterService.js";
import type {SimpleMatchResult, SimpleRouteHandler} from "../router/simple-types.js";
import {useRuntime} from "./RuntimeProvider.js";

/**
 * Hook to get the router service
 */
export function useRouterService() {
	const runtime = useRuntime();
	const [routerService, setRouterService] = useState<{
		addRoute: (path: string, handler: SimpleRouteHandler) => Effect.Effect<void, never, never>;
		navigate: (path: string) => Effect.Effect<void, never, never>;
		currentRoute: SubscriptionRef.SubscriptionRef<SimpleMatchResult | null>;
		initialize: Effect.Effect<void, never, never>;
	} | null>(null);

	useEffect(() => {
		const effect = Effect.gen(function* () {
			const service = yield* SimpleRouterService;
			setRouterService(service);
		});

		runtime.runPromise(effect);
	}, [runtime]);

	if (!routerService) {
		throw new Error("Router service not initialized");
	}

	return routerService;
}

/**
 * Hook to subscribe to current route changes using Effect streams
 */
export function useCurrentRoute(): SimpleMatchResult | null {
	const runtime = useRuntime();
	const routerService = useRouterService();
	const [currentRoute, setCurrentRoute] = useState<SimpleMatchResult | null>(null);

	useEffect(() => {
		// Stream-based subscription to route changes
		const subscribeToRouteChanges = Effect.gen(function* () {
			// Get initial value
			const initial = yield* SubscriptionRef.get(routerService.currentRoute);
			setCurrentRoute(initial);

			// For now, let's use polling until we figure out the proper stream API
			while (true) {
				const current = yield* SubscriptionRef.get(routerService.currentRoute);
				setCurrentRoute(current);
				yield* Effect.sleep("100 millis");
			}
		});

		// Run the subscription
		const fiber = runtime.runFork(subscribeToRouteChanges);

		// Cleanup: interrupt the fiber
		return () => {
			runtime.runFork(Fiber.interrupt(fiber));
		};
	}, [runtime, routerService]);

	return currentRoute;
}
