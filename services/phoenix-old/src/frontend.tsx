/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import {Effect, Layer, ManagedRuntime} from "effect";
import {createBrowserHistory} from "history";
import {createRouter} from "radix3";
import * as React from "react";
import {StrictMode, Suspense, use} from "react";
import {createRoot} from "react-dom/client";
import * as History from "./sixtysix/History.js";
import * as Router from "./sixtysix/Router.js";

const runtime = ManagedRuntime.make(
	Layer.mergeAll(
		Router.layer(createRouter).pipe(Layer.provideMerge(History.layer(createBrowserHistory))),
	),
);

const RuntimeContext = React.createContext(runtime);

const useRuntime = () => React.use(RuntimeContext);

const useHistory = () => {
	const runt = useRuntime();
};

function Example({effect}: {effect: Promise<History.HistoryApi>}) {
	return (
		<button
			type="button"
			onClick={() => {
				console.log("falanca");
			}}
		>
			click me to change the URL
		</button>
	);
}

const program = Effect.gen(function* () {
	const history = yield* History.History;
	const router = yield* Router.Router;
	yield* router.insert("/time/:time", {
		_tag: "RouteData",
		handler: (match) => {
			console.log({match});
		},
	});

	return history;
}).pipe(runtime.runPromise);

// biome-ignore lint/style/noNonNullAssertion: that's ok
const elem = document.getElementById("root")!;

const app = (
	<StrictMode>
		<Suspense>
			<Example effect={program} />
		</Suspense>
	</StrictMode>
);

if (import.meta.hot) {
	// With hot module reloading, `import.meta.hot.data` is persisted.
	import.meta.hot.data.root ??= createRoot(elem);
	const root = import.meta.hot.data.root;
	root.render(app);
} else {
	// The hot module reloading API is not available in production.
	createRoot(elem).render(app);
}
