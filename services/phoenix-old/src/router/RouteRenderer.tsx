/**
 * RouteRenderer - Bridges Effect to React element conversion
 */

import type {Effect} from "effect";
import {type ReactElement, use} from "react";
import {useRuntime} from "../runtime/RuntimeProvider";

export interface RouteRendererProps {
	effect: Effect.Effect<ReactElement, never, never>;
}

/**
 * RouteRenderer bridges Effect computations to React elements
 * Uses React's `use` hook for automatic Suspense and ErrorBoundary integration
 */
export const RouteRenderer = ({effect}: RouteRendererProps) => {
	const runtime = useRuntime();

	// Convert Effect to Promise and use React's `use` hook
	// This automatically integrates with Suspense and ErrorBoundary
	const element = use(runtime.runPromise(effect));

	return element;
};
