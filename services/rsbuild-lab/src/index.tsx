import React from "react";
import ReactDOM from "react-dom/client";
import {Chunk, Effect, Stream, StreamEmit} from "effect";
import App from "./App";

const rootEl = document.getElementById("root");
if (rootEl) {
	const root = ReactDOM.createRoot(rootEl);
	root.render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
	);
}

const program = Effect.gen(function* () {
	const stream = Stream.async((emit: StreamEmit.Emit<never, never, PointerEvent, void>) => {
		document.addEventListener("click", (event) => {
			emit(Effect.succeed(Chunk.of(event)));
		});
	});

	yield* Stream.runForEach(stream, (event) => Effect.log("event happened", event));
});

Effect.runPromise(program);
