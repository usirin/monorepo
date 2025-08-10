import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Ref from "effect/Ref";
import {
	StudioCommandRegistry,
	type UICommandEntry,
	type UICommandWithAction,
	type UICommandWithChildren,
} from "./CommandRegistry";

// Command palette state
export interface CommandPaletteState {
	readonly isOpen: boolean;
	readonly query: string;
	readonly selectedIndex: number;
	readonly navigationStack: readonly string[];
	readonly currentResults: readonly UICommandEntry[];
}

export class StudioCommandPallette extends Effect.Service<StudioCommandPallette>()(
	"StudioCommandPallette",
	{
		dependencies: [StudioCommandRegistry.Default],
		effect: Effect.gen(function* () {
			const registry = yield* StudioCommandRegistry;
			const state = yield* Ref.make<CommandPaletteState>({
				isOpen: false,
				query: "",
				selectedIndex: 0,
				navigationStack: [],
				currentResults: [],
			});

			const updateResults = (query: string) =>
				Effect.gen(function* () {
					const currentState = yield* Ref.get(state);
					const currentCommandId =
						currentState.navigationStack[currentState.navigationStack.length - 1];

					let results: readonly UICommandEntry[];

					if (currentCommandId) {
						const currentCommand = yield* registry.getById(currentCommandId);
						if (Option.isSome(currentCommand) && "children" in currentCommand.value) {
							results = currentCommand.value.children.filter((child) =>
								child.label.toLowerCase().includes(query.toLowerCase()),
							);
						} else {
							results = [];
						}
					} else {
						results = query ? yield* registry.search(query) : yield* registry.getAll();
					}

					yield* Ref.update(state, (current) => ({
						...current,
						currentResults: results,
						selectedIndex: Math.min(current.selectedIndex, Math.max(0, results.length - 1)),
					}));
				});

			const open = () =>
				Effect.gen(function* () {
					yield* Ref.update(state, (current) => ({...current, isOpen: true}));
					yield* updateResults("");
				});

			const close = () =>
				Ref.update(state, (current) => ({
					...current,
					isOpen: false,
					query: "",
					selectedIndex: 0,
					navigationStack: [],
					currentResults: [],
				}));

			const setQuery = (query: string) =>
				Effect.gen(function* () {
					yield* Ref.update(state, (current) => ({...current, query}));
					yield* updateResults(query);
				});

			const selectNext = () =>
				Effect.gen(function* () {
					const currentState = yield* Ref.get(state);
					const nextIndex = Math.min(
						currentState.selectedIndex + 1,
						currentState.currentResults.length - 1,
					);
					yield* Ref.update(state, (current) => ({...current, selectedIndex: nextIndex}));
				});

			const selectPrevious = () =>
				Effect.gen(function* () {
					const currentState = yield* Ref.get(state);
					const prevIndex = Math.max(currentState.selectedIndex - 1, 0);
					yield* Ref.update(state, (current) => ({...current, selectedIndex: prevIndex}));
				});

			const executeSelected = () =>
				Effect.gen(function* () {
					const currentState = yield* Ref.get(state);
					const selectedCommand = currentState.currentResults[currentState.selectedIndex];

					if (!selectedCommand) return;

					if ("action" in selectedCommand) {
						yield* selectedCommand.action;
						yield* close();
					} else if ("children" in selectedCommand) {
						yield* navigateToCommand(selectedCommand.id);
					}
				});

			const navigateToCommand = (commandId: string) =>
				Effect.gen(function* () {
					yield* Ref.update(state, (current) => ({
						...current,
						navigationStack: [...current.navigationStack, commandId],
						query: "",
						selectedIndex: 0,
					}));
					yield* updateResults("");
				});

			const navigateBack = () =>
				Effect.gen(function* () {
					const currentState = yield* Ref.get(state);
					if (currentState.navigationStack.length > 0) {
						const newStack = currentState.navigationStack.slice(0, -1);
						yield* Ref.update(state, (current) => ({
							...current,
							navigationStack: newStack,
							query: "",
							selectedIndex: 0,
						}));
						yield* updateResults("");
					}
				});

			return {
				state: Ref.get(state),
				open,
				close,
				setQuery,
				selectNext,
				selectPrevious,
				executeSelected,
				navigateToCommand,
				navigateBack,
			};
		}),
	},
) {}

// Helper functions for creating commands
export const createCommand = (
	id: string,
	label: string,
	description: string,
	group: string,
	action: Effect.Effect<void, never, never>,
	options: {
		keywords?: readonly string[];
		icon?: string;
		shortcut?: string;
	} = {},
): UICommandWithAction => ({
	id,
	label,
	description,
	group,
	keywords: options.keywords ?? [],
	icon: options.icon,
	shortcut: options.shortcut,
	action,
});

export const createCommandWithChildren = (
	id: string,
	label: string,
	description: string,
	group: string,
	children: readonly UICommandEntry[],
	options: {
		keywords?: readonly string[];
		icon?: string;
		shortcut?: string;
	} = {},
): UICommandWithChildren => ({
	id,
	label,
	description,
	group,
	keywords: options.keywords ?? [],
	icon: options.icon,
	shortcut: options.shortcut,
	children,
});
