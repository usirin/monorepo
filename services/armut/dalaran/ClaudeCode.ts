import * as Api from "@anthropic-ai/claude-code";
import {Data, Effect, Stream} from "effect";

export class ClaudeCodeError extends Data.TaggedError("ClaudeCodeError")<{
	cause: unknown;
}> {}

export class ClaudeCode extends Effect.Service<ClaudeCode>()("ClaudeCode", {
	scoped: Effect.gen(function* () {
		yield* Effect.log("Initializing ClaudeCode service");

		const query = ({prompt, options}: {prompt: string; options?: Api.Options}) =>
			Stream.fromAsyncIterable(
				Api.query({prompt, options}),
				(e) => new ClaudeCodeError({cause: e}),
			);

		return {query};
	}),
}) {}
