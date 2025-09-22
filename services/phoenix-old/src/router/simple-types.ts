/**
 * Simplified type definitions for sixtysix router
 */

import type {Effect} from "effect";
import type {ReactElement} from "react";

// Simplified route handler type
export type SimpleRouteHandler = (
	params: Record<string, string>,
) => Effect.Effect<ReactElement, never, never>;

// Route matching result
export interface SimpleMatchResult {
	handler: SimpleRouteHandler;
	params: Record<string, string>;
	query: URLSearchParams;
}

// Route registry
export interface SimpleRouteRegistry {
	readonly [pattern: string]: SimpleRouteHandler;
}
