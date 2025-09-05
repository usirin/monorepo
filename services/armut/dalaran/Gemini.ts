import * as Api from "@google/genai";
import {Data, Effect} from "effect";

export class GeminiError extends Data.TaggedError("GeminiError")<{
	method: string;
	cause: unknown;
}> {}

export class Gemini extends Effect.Service<Gemini>()("Gemini", {
	effect: Effect.gen(function* () {
		const ai = new Api.GoogleGenAI({
			vertexai: true,
			project: "armut-finance",
			location: "us-central1",
		});

		const use = Effect.fn("Gemini.use")(
			<A>(
				f: (ai: Api.GoogleGenAI, signal: AbortSignal) => Promise<A>,
			): Effect.Effect<A, GeminiError> => {
				return Effect.tryPromise({
					try: (signal) => f(ai, signal),
					catch: (cause) => new GeminiError({method: "Gemini.use", cause}),
				});
			},
		);

		const generateContent = Effect.fn("Gemini.generateContent")(
			(params: Omit<Api.GenerateContentParameters, "model">) =>
				use((ai) =>
					ai.models
						.generateContent({model: "gemini-2.5-flash-lite", ...params})
						.then((res) => res.text),
				),
		);

		return {use, generateContent};
	}),
}) {}
