import {Config, Effect} from "effect";

export class Environment extends Effect.Service<Environment>()("Environment", {
	effect: Effect.gen(function* () {
		yield* Effect.log("Environment service initialized");

		// Placeholder for environment service logic
		return {
			SIMPLEFIN_TOKEN: yield* Config.redacted("SIMPLEFIN_TOKEN"),
			SIMPLEFIN_ACCESS_URL: yield* Config.redacted("SIMPLEFIN_ACCESS_URL"),
			DATABASE_URL: yield* Config.redacted("DATABASE_URL"),
		};
	}),
}) {}
