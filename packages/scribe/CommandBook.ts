import {Data, Effect, Redacted} from "effect";
import {Discord} from "./Discord";
import {Env} from "./Env";
import {Routes, type RESTPostAPIApplicationCommandsJSONBody} from "discord-api-types/v10";

export class CommandBookError extends Data.TaggedError("CommandBookError")<{
	method: string;
	cause: unknown;
}> {}

export class CommandBook extends Effect.Service<CommandBook>()("CommandBook", {
	dependencies: [Discord.Default, Env.Default],
	scoped: Effect.gen(function* () {
		const discord = yield* Discord;
		const env = yield* Env;

		const appId = env.DISCORD_APP_ID;

		const global = Effect.fn("CommandBook.global")(function* (
			commands: RESTPostAPIApplicationCommandsJSONBody[],
		) {
			const result = yield* discord.use(async (client) => {
				return client.put(Routes.applicationCommands(Redacted.value(appId)), {
					body: commands,
				});
			});

			return result;
		});

		return {global};
	}),
}) {}
