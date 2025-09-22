/**
 * Simplified RouterComponent implementation
 */

import {useEffect} from "react";
import {useRuntime} from "../runtime/RuntimeProvider.js";
import {useRouterService, useCurrentRoute} from "../runtime/simple-hooks.js";
import {RouteRenderer} from "./RouteRenderer.js";

const NotFoundPage = () => (
	<div style={{padding: "2rem", textAlign: "center"}}>
		<h1>404 - Page Not Found</h1>
		<p>The page you're looking for doesn't exist.</p>
	</div>
);

export interface SimpleRouterComponentProps {
	fallback?: React.ComponentType;
}

export const SimpleRouterComponent = ({
	fallback = NotFoundPage,
}: SimpleRouterComponentProps = {}) => {
	const runtime = useRuntime();
	const routerService = useRouterService();
	const currentRoute = useCurrentRoute();

	// Initialize router on component mount
	useEffect(() => {
		runtime.runPromise(routerService.initialize);
	}, [runtime, routerService]);

	// If no route is matched, show fallback
	if (!currentRoute) {
		const FallbackComponent = fallback;
		return <FallbackComponent />;
	}

	// Render the matched route using RouteRenderer
	return <RouteRenderer effect={currentRoute.handler(currentRoute.params)} />;
};
