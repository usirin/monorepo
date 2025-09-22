/**
 * Type definitions for sixtysix router
 */

import type {Effect} from "effect";
import type {ReactElement} from "react";

// Route handler type - Effect that resolves to ReactElement
export type RouteHandler<P = Record<string, string>> = (
	params: P,
) => Effect.Effect<ReactElement, never, never>;

// Route matching result
export interface MatchResult<P = Record<string, string>> {
	handler: RouteHandler<P>;
	params: P;
	query: URLSearchParams;
}

// Route registry - internal data structure
export interface RouteRegistry {
	readonly [pattern: string]: RouteHandler;
}

// Router data structure for immutable composition
export interface RouterData<Routes extends RouteRegistry = RouteRegistry> {
	readonly _tag: "RouterData";
	readonly routes: Routes;
}
