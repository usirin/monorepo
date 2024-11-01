import {
	type StackPath,
	type Tree,
	createStack,
	createTree,
	createWindow,
	getAt,
	moveAfter,
	moveBefore,
	remove,
	split,
	updateWindow,
} from "@umut/layout-tree";
import {z} from "zod";
import {create} from "zustand";
import {createJSONStorage, devtools, persist} from "zustand/middleware";
import {immer} from "zustand/middleware/immer";

export interface WorkspaceContextType {
	workspace: {
		layout: Tree;
		focused: StackPath;
	};
}
export interface Command<TName extends string, TSchema extends z.ZodType> {
	name: TName;
	description: string;
	parameters: TSchema;
	execute: (args: z.infer<TSchema>) => void;
}

export const useWorkspaceStore = create<WorkspaceContextType>()(
	devtools(
		persist(
			immer(() => ({
				workspace: {
					layout: createTree(
						createStack("vertical", [
							createWindow("scratch"),
							createWindow("time"),
							createWindow("sandpack"),
							createWindow("counter"),
						]),
					),
					focused: [0],
				},
			})),
			{
				name: "usir-in-workspace",
				storage: createJSONStorage(() => localStorage),
				partialize: (state) => ({workspace: state.workspace}),
			},
		),
	),
);

export function createCommand<TName extends string, TSchema extends z.ZodType>({
	name,
	description,
	parameters,
	execute,
}: {
	name: TName;
	description: string;
	parameters: TSchema;
	execute: (args: z.infer<TSchema>) => void;
}) {
	return {name, description, parameters, execute};
}

export const commands = {
	focus: createCommand({
		name: "focus",
		description: "Focus on a specific path in the workspace",
		parameters: z.object({
			path: z.array(z.number()),
		}),
		execute: ({path}) => {
			useWorkspaceStore.setState((state) => {
				state.workspace.focused = path;
			});
		},
	}),
	remove: createCommand({
		name: "remove",
		description: "Remove a widget from the current workspace",
		parameters: z.object({
			path: z.array(z.number()),
		}),
		execute: ({path}) => {
			useWorkspaceStore.setState((state) => {
				state.workspace.layout = remove(state.workspace.layout, path);
				if (state.workspace.focused.join(",") === path.join(",")) {
					state.workspace.focused = [];
				}
			});
		},
	}),
	updateWindow: createCommand({
		name: "updateWindow",
		description: "Update a window in the workspace",
		parameters: z.object({
			path: z.array(z.number()),
			key: z.string().describe("The key of the widget to update"),
		}),
		execute: ({path, key}) => {
			useWorkspaceStore.setState((state) => {
				state.workspace.layout = updateWindow(state.workspace.layout, path, key);
			});
		},
	}),
	moveBefore: createCommand({
		name: "moveBefore",
		description: "Move a widget before another in the workspace",
		parameters: z.object({
			path: z.array(z.number()),
			before: z.array(z.number()),
		}),
		execute: ({path, before}) => {
			useWorkspaceStore.setState((state) => {
				state.workspace.layout = moveBefore(state.workspace.layout, path, before);
			});
		},
	}),
	moveAfter: createCommand({
		name: "moveAfter",
		description: "Move a widget after another in the workspace",
		parameters: z.object({
			path: z.array(z.number()),
			after: z.array(z.number()),
		}),
		execute: ({path, after}) => {
			useWorkspaceStore.setState((state) => {
				state.workspace.layout = moveAfter(state.workspace.layout, path, after);
			});
		},
	}),
	split: createCommand({
		name: "split",
		description: "Split the current workspace",
		parameters: z.object({
			path: z.array(z.number()),
			orientation: z.enum(["horizontal", "vertical"]),
		}),
		execute: ({path, orientation}) => {
			useWorkspaceStore.setState((state) => {
				state.workspace.layout = split(
					state.workspace.layout,
					path ?? state.workspace.focused,
					orientation ?? "horizontal",
				);
				if (getAt(state.workspace.layout.root, state.workspace.focused)?.tag === "stack") {
					state.workspace.focused.push(0);
				}
			});
		},
	}),
} satisfies Record<string, Command<string, z.ZodType>>;

const executeCommand = <T extends Command<string, z.ZodType>>(
	command: T,
	args: z.infer<T["parameters"]>,
) => {
	if (!command.parameters.safeParse(args).success) {
		throw new Error("Invalid arguments");
	}
	command.execute(args);
};
