import {Effect} from "effect";
import {useEffect} from "react";
import {SimpleRouterComponent} from "./router/SimpleRouterComponent.js";
import {useRuntime} from "./runtime/RuntimeProvider.js";
import {useRouterService} from "./runtime/simple-hooks.js";
import "./index.css";

import logo from "./logo.svg";
import reactLogo from "./react.svg";

// Simple home page component
const HomePage = () => (
	<div className="app">
		<div className="logo-container">
			<img src={logo} alt="Bun Logo" className="logo bun-logo" />
			<img src={reactLogo} alt="React Logo" className="logo react-logo" />
		</div>
		<h1>sixtysix Router + Effect</h1>
		<p>Welcome to the future of React routing with Effect-TS!</p>
	</div>
);

export function App() {
	const runtime = useRuntime();
	const routerService = useRouterService();

	useEffect(() => {
		// Configure routes
		const setupRoutes = Effect.gen(function* () {
			yield* routerService.addRoute("/", () => Effect.succeed(<HomePage />));
			yield* routerService.initialize;
		});

		runtime.runPromise(setupRoutes);
	}, [runtime, routerService]);

	return <SimpleRouterComponent />;
}

export default App;
