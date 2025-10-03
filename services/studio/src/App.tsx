import * as React from "react";
import "./App.css";

import * as Runtime from "./sixtysix/Runtime";
import * as Router from "./sixtysix/Router";
import * as History from "./sixtysix/History";
import {Effect} from "effect";

const runtime = Runtime.make();

const App: React.FC = () => {
	React.useEffect(() => {
		const program = Effect.gen(function* () {
			const router = yield* Router.Router;
			const history = yield* History.History;

			const listener = history.listen().pipe(
				Stream.runForEach(
					Effect.fn("Router.historyListener")((update) => {
						console.log({update});
						const res = client.lookup(update.location.pathname);
						if (!res) return Effect.succeed(null);

						res.handler(res);

						return Effect.succeed(update);
					}),
				),
			);

			router.insert("/", {
				_tag: "RouteData",
				handler: (res) => {
					console.log(">>>> match /", res);
				},
			});
		});

		runtime
			.runPromise(program)
			.then((success) => {
				console.log({success});
			})
			.catch((err) => {
				console.error(">> error", err);
			});
	}, []);

	return (
		<div>
			<div>hello world</div>
		</div>
	);
};

export default App;
