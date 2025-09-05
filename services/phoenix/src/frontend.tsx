/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter, Route, Routes} from "react-router";
import {App} from "./App";

const elem = document.getElementById("root")!;
const app = (
	<StrictMode>
		<BrowserRouter>
			{/* @ts-ignore - React Router v7 type compatibility with React 19 */}
			<Routes>
				<Route path="/" element={<App />} />
			</Routes>
		</BrowserRouter>
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
