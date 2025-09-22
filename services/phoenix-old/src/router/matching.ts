/**
 * Route matching utilities using path-to-regexp
 */

interface MatchResult {
	params: Record<string, string>;
	query: URLSearchParams;
}

/**
 * Simple route matching without path-to-regexp for now
 * Just match exact paths and basic parameter extraction
 */
export function matchPath(pattern: string, path: string): MatchResult | null {
	// Extract pathname from full URL if needed
	const pathname = path.includes("?") ? path.split("?")[0] : path;

	if (!pathname) {
		return null;
	}

	// For now, just do exact matching
	if (pattern === pathname) {
		const queryString = path.includes("?") ? path.split("?")[1] : "";
		const query = new URLSearchParams(queryString);
		return {params: {}, query};
	}

	// Basic parameter matching for patterns like "/users/:id"
	const patternParts = pattern.split("/");
	const pathParts = pathname.split("/");

	if (patternParts.length !== pathParts.length) {
		return null;
	}

	const params: Record<string, string> = {};

	for (let i = 0; i < patternParts.length; i++) {
		const patternPart = patternParts[i];
		const pathPart = pathParts[i];

		if (!patternPart || !pathPart) {
			continue;
		}

		if (patternPart.startsWith(":")) {
			// This is a parameter
			const paramName = patternPart.slice(1);
			params[paramName] = decodeURIComponent(pathPart);
		} else if (patternPart !== pathPart) {
			// Static part doesn't match
			return null;
		}
	}

	// Extract query parameters
	const queryString = path.includes("?") ? path.split("?")[1] : "";
	const query = new URLSearchParams(queryString);

	return {params, query};
}
