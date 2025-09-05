import {Effect} from "effect";
import {CommandBook} from "./CommandBook";
import {
	ApplicationCommandType,
	ApplicationIntegrationType,
	type RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";
import {SlashCommandBuilder} from "@discordjs/builders";

// Create a slash command builder
const pingCommand = new SlashCommandBuilder()
	.setName("ping")
	.setDescription("Check if this interaction is responsive");

// Get the raw data that can be sent to Discord
const rawData = pingCommand.toJSON();

export class Commands extends Effect.Service<Commands>()("Commands", {
	dependencies: [CommandBook.Default],
	scoped: Effect.gen(function* () {
		const book = yield* CommandBook;

		// TODO: this needs to be a module, not a service.
		// we need to provide a factory/builder to build a global/guild scope
		// command.

		const commands = [
			{
				name: "test",
				description: "Basic command",
				type: ApplicationCommandType.ChatInput,
			},
		] as RESTPostAPIApplicationCommandsJSONBody[];

		const install = Effect.fn("Commands.install")(function* () {
			return yield* book.global(commands);
		});

		return {install};
	}),
}) {}
