import {type Window, findSibling, findWindowPath} from "@usirin/layout-tree";
import {createSpell, createSpellbook, execute} from "@usirin/spellbook/spellbook";
import {
	type Studio,
	addWorkspace,
	createStudio,
	focusWindow,
	getActiveWorkspace,
	getWorkspace,
	removeWindow,
	removeWorkspace,
	setActiveWorkspace,
	splitWindow,
	updateWindow,
} from "@usirin/studio";
import {z} from "zod";
import {create} from "zustand";
import {createJSONStorage, devtools, persist} from "zustand/middleware";
import {immer} from "zustand/middleware/immer";
import type {WidgetID} from "./widget";
import {widgets} from "./widgets";

interface StudioState {
	state: Studio;
}

export const useStudioManager = create<StudioState>()(
	devtools(
		persist(
			immer(() => ({
				state: createStudio(),
			})),
			{
				name: "studio-manager",
				storage: createJSONStorage(() => localStorage),
			},
		),
	),
);

export const newSpellbook = createSpellbook({
	"workspace:create": createSpell({
		description: "Create a new workspace",
		parameters: z.void(),
		result: z.void(),
		execute: async () => {
			useStudioManager.setState((studio) => ({
				state: addWorkspace(studio.state),
			}));
		},
	}),
	"workspace:remove": createSpell({
		description: "Remove the active workspace",
		parameters: z.object({id: z.string().optional()}),
		result: z.void(),
		execute: async ({id}) => {
			useStudioManager.setState((studio) => ({
				state: removeWorkspace(
					studio.state,
					(id as `workspace_${string}`) ?? studio.state.activeWorkspace,
				),
			}));
		},
	}),
	"workspace:set-active": createSpell({
		description: "Set the active workspace",
		parameters: z.object({
			id: z.string(),
		}),
		result: z.void(),
		execute: async ({id}) => {
			useStudioManager.setState((studio) => ({
				state: setActiveWorkspace(studio.state, id as `workspace_${string}`),
			}));
		},
	}),
	"window:split-horizontal": createSpell({
		description: "Split the focused window horizontally",
		parameters: z.void(),
		result: z.void(),
		execute: async () => {
			useStudioManager.setState((studio) => {
				const workspace = getActiveWorkspace(studio.state);
				if (!workspace) return studio;

				studio.state.workspaces[workspace.id] = splitWindow(workspace, "horizontal");
			});
		},
	}),
	"window:split-vertical": createSpell({
		description: "Split the focused window vertically",
		parameters: z.void(),
		result: z.void(),
		execute: async () => {
			useStudioManager.setState((studio) => {
				const workspace = getWorkspace(studio.state, studio.state.activeWorkspace);
				if (!workspace) return studio;

				studio.state.workspaces[workspace.id] = splitWindow(workspace, "vertical");
			});
		},
	}),
	"window:close": createSpell({
		description: "Close the focused window",
		parameters: z.void(),
		result: z.void(),
		execute: async () => {
			useStudioManager.setState((state) => {
				const workspace = getActiveWorkspace(state.state);
				if (!workspace) return state;

				state.state.workspaces[workspace.id] = removeWindow(workspace, workspace.focused);
				return state;
			});
		},
	}),
	"window:focus-left": createSpell({
		description: "Focus the window to the left",
		parameters: z.void(),
		result: z.void(),
		execute: async () => {
			useStudioManager.setState((studio) => {
				const workspace = getActiveWorkspace(studio.state);
				if (!workspace) return studio;

				const sibling = findSibling(workspace.layout, workspace.focused, "left");
				if (!sibling) return studio;

				const siblingPath = findWindowPath(workspace.layout, sibling);
				if (!siblingPath) return studio;

				studio.state.workspaces[workspace.id] = focusWindow(workspace, siblingPath);
				return studio;
			});
		},
	}),
	"window:focus-right": createSpell({
		description: "Focus the window to the right",
		parameters: z.void(),
		result: z.void(),
		execute: async () => {
			useStudioManager.setState((studio) => {
				const workspace = getActiveWorkspace(studio.state);
				if (!workspace) return studio;

				const sibling = findSibling(workspace.layout, workspace.focused, "right");
				if (!sibling) return studio;

				const siblingPath = findWindowPath(workspace.layout, sibling);
				if (!siblingPath) return studio;

				studio.state.workspaces[workspace.id] = focusWindow(workspace, siblingPath);
				return studio;
			});
		},
	}),
	"window:focus-up": createSpell({
		description: "Focus the window above",
		parameters: z.void(),
		result: z.void(),
		execute: async () => {
			useStudioManager.setState((studio) => {
				const workspace = getActiveWorkspace(studio.state);
				if (!workspace) return studio;

				const sibling = findSibling(workspace.layout, workspace.focused, "up");
				if (!sibling) return studio;

				const siblingPath = findWindowPath(workspace.layout, sibling);
				if (!siblingPath) return studio;

				studio.state.workspaces[workspace.id] = focusWindow(workspace, siblingPath);
				return studio;
			});
		},
	}),
	"window:focus-down": createSpell({
		description: "Focus the window below",
		parameters: z.void(),
		result: z.void(),
		execute: async () => {
			useStudioManager.setState((studio) => {
				const workspace = getActiveWorkspace(studio.state);
				if (!workspace) return studio;

				const sibling = findSibling(workspace.layout, workspace.focused, "down");
				if (!sibling) return studio;

				const siblingPath = findWindowPath(workspace.layout, sibling);
				if (!siblingPath) return studio;

				studio.state.workspaces[workspace.id] = focusWindow(workspace, siblingPath);
				return studio;
			});
		},
	}),
	"window:focus": createSpell({
		description: "Focus the window",
		parameters: z.object({
			path: z.array(z.number()),
		}),
		result: z.void(),
		execute: async ({path}) => {
			useStudioManager.setState((studio) => {
				const workspace = getActiveWorkspace(studio.state);
				if (!workspace) return studio;
				studio.state.workspaces[workspace.id] = focusWindow(workspace, path);
			});
		},
	}),
	"widget:list": createSpell({
		description: "List all available widgets",
		parameters: z.void(),
		result: z.any(),
		execute: async (_params) => {
			return createSpellbook({
				"widget:counter": createSpell({
					description: "Information about counter widget",
					parameters: z.void(),
					result: z.void(),
					execute: async () => {
						useStudioManager.setState((studio) => {
							const workspace = getActiveWorkspace(studio.state);
							if (!workspace) return studio;

							studio.state.workspaces[workspace.id] = updateWindow(
								workspace,
								workspace.focused,
								"counter",
							);
							return studio;
						});
					},
				}),
				"widget:time": createSpell({
					description: "Information about time widget",
					parameters: z.void(),
					result: z.void(),
					execute: async () => {
						useStudioManager.setState((studio) => {
							const workspace = getActiveWorkspace(studio.state);
							if (!workspace) return studio;

							studio.state.workspaces[workspace.id] = updateWindow(
								workspace,
								workspace.focused,
								"time",
							);
							return studio;
						});
					},
				}),
				"widget:scratch": createSpell({
					description: "Information about scratch widget",
					parameters: z.void(),
					result: z.void(),
					execute: async () => {
						useStudioManager.setState((studio) => {
							const workspace = getActiveWorkspace(studio.state);
							if (!workspace) return studio;

							studio.state.workspaces[workspace.id] = updateWindow(
								workspace,
								workspace.focused,
								"scratch",
							);
							return studio;
						});
					},
				}),
				"widget:flow": createSpell({
					description: "render flow widget",
					parameters: z.void(),
					result: z.void(),
					execute: async () => {
						useStudioManager.setState((studio) => {
							const workspace = getActiveWorkspace(studio.state);
							if (!workspace) return studio;

							studio.state.workspaces[workspace.id] = updateWindow(
								workspace,
								workspace.focused,
								"flow",
							);
							return studio;
						});
					},
				}),
			});
		},
	}),
});
