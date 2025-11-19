import {createRouter, type RadixRouter} from "radix3";
import * as React from "react";

function shouldNotIntercept(event: NavigateEvent) {
	return (
		!event.canIntercept ||
		// If this is just a hashChange,
		// just let the browser handle scrolling to the content.
		event.hashChange ||
		// If this is a download,
		// let the browser perform the download.
		event.downloadRequest ||
		// If this is a form submission,
		// let that go to the server.
		event.formData
	);
}
type Route = {
	handler: (args: {params?: Record<string, unknown>}) => React.ReactNode;
};

const RouterContext = React.createContext<RadixRouter<Route> | null>(null);

function useRouter() {
	const router = React.use(RouterContext);
	if (!router) {
		throw new Error("useRouter must be used within a Router");
	}

	return router;
}

export function Router({children}: {children: React.ReactNode}) {
	const [route, setRoute] = React.useState<React.ReactNode>(null);
	const [router] = React.useState(() => createRouter<Route>());
	React.useEffect(() => {
		function navigateHandler(event: NavigateEvent) {
			if (shouldNotIntercept(event)) return;

			const url = new URL(event.destination.url);
			const route = router.lookup(url.pathname);

			if (route) {
				event.intercept({
					async handler() {
						setRoute(route.handler({params: route.params}));
					},
				});
			} else {
				setRoute(null);
			}
		}

		window.navigation.addEventListener("navigate", navigateHandler);

		const route = router.lookup(location.pathname);
		if (!route) return;

		setRoute(route.handler({params: route.params}));

		return () => {
			window.navigation.removeEventListener("navigate", navigateHandler);
		};
	}, []);

	return (
		<RouterContext.Provider value={router}>
			{children}
			{route}
		</RouterContext.Provider>
	);
}

export function Route({path, children}: {path: string; children: Route["handler"]}) {
	const router = useRouter();

	React.useEffect(() => {
		router.insert(path, {
			handler: async (args) => {
				return children(args);
			},
		});

		return () => {
			router.remove(path);
		};
	}, [router]);

	return null;
}
