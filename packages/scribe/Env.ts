import {Config, Effect} from "effect";

export class Env extends Effect.Service<Env>()("Env", {
	effect: Effect.gen(function* () {
		yield* Effect.log("Environment service initialized");

		return {
			DISCORD_PUBLIC_KEY: yield* Config.redacted("DISCORD_PUBLIC_KEY"),
			DISCORD_APP_ID: yield* Config.redacted("DISCORD_APP_ID"),
			DISCORD_BOT_TOKEN: yield* Config.redacted("DISCORD_BOT_TOKEN"),
		};
	}),
}) {}
