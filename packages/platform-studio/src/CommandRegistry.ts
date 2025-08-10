import * as Command from "@effect/platform/Command";
import * as CommandExecutor from "@effect/platform/CommandExecutor";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as Ref from "effect/Ref";

export interface UICommand {
	readonly id: string;
	readonly label: string;
	readonly description: string;
	readonly group: string;
	readonly keywords: readonly string[];
	readonly icon?: string;
	readonly shortcut?: string;
}

export interface UICommandWithAction extends UICommand {
	readonly action: Effect.Effect<void, never, never>;
}

export interface UICommandWithChildren extends UICommand {
	readonly children: readonly UICommandEntry[];
}

export type UICommandEntry = UICommandWithAction | UICommandWithChildren;

export class StudioCommandRegistry extends Effect.Service<StudioCommandRegistry>()(
	"StudioCommandRegistry",
	{
		effect: Effect.gen(function* () {
			const commands = yield* Ref.make(HashMap.empty<string, UICommandEntry>());
			const commandExecutor = yield* CommandExecutor.CommandExecutor;

			const register = (command: UICommandEntry) =>
				Ref.update(commands, HashMap.set(command.id, command));

			const unregister = (id: string) => Ref.update(commands, HashMap.remove(id));

			const getAll = () =>
				Effect.gen(function* () {
					const allCommands = yield* Ref.get(commands);
					return Array.from(HashMap.values(allCommands));
				});

			const getById = (id: string) =>
				Effect.gen(function* () {
					const allCommands = yield* Ref.get(commands);
					return HashMap.get(allCommands, id);
				});

			const getByGroup = (group: string) =>
				Effect.gen(function* () {
					const allCommands = yield* Ref.get(commands);
					return Array.from(HashMap.values(allCommands)).filter((cmd) => cmd.group === group);
				});

			const search = (query: string) =>
				Effect.gen(function* () {
					const allCommands = yield* Ref.get(commands);
					const lowerQuery = query.toLowerCase();

					return Array.from(HashMap.values(allCommands)).filter(
						(cmd) =>
							cmd.label.toLowerCase().includes(lowerQuery) ||
							cmd.description.toLowerCase().includes(lowerQuery) ||
							cmd.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery)),
					);
				});

			const executeCommand = (id: string, args: readonly string[]) =>
				Effect.gen(function* () {
					// Convert UI command to platform command and execute
					const platformCommand = Command.make(id, ...args);
					return yield* commandExecutor.start(platformCommand);
				});

			return {
				register,
				unregister,
				getAll,
				getById,
				getByGroup,
				search,
				executeCommand,
			};
		}),
	},
) {}
