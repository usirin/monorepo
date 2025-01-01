import * as Http from "@effect/platform/HttpClient";
import * as Rpc from "@effect/rpc";
import {Effect, Ref, Stream} from "effect";

// Widget definition
interface Widget<State> {
	uri: `widget://${string}`;
	state: Effect.Effect<never, Error, Stream.Stream<never, Error, State>>;
	rpc: Rpc.Router<{
		getState: () => State;
		subscribe: () => Stream.Stream<never, Error, State>;
	}>;
}

// Example chat widget
const chatWidget = Effect.gen(function* (_) {
	// Create ref for state
	const stateRef = yield* Ref.make<ChatState>(initialState);

	// Create state stream
	const updates = yield* Stream.fromRef(stateRef);

	// Expose as widget
	return {
		uri: "widget://usir.in/chat",
		state: Effect.succeed(updates),
		rpc: Rpc.router({
			getState: () => Ref.get(stateRef),
			subscribe: () => updates,
		}),
	};
});
