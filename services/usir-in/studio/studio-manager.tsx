import {findSibling, findWindowPath} from "@usirin/layout-tree";
import {Spellbook} from "@usirin/spellbook";
import {createSpell, createSpellbook} from "@usirin/spellbook/spellbook";
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
} from "@usirin/studio";
import {z} from "zod";
import {create} from "zustand";
import {createJSONStorage, devtools, persist} from "zustand/middleware";
import {immer} from "zustand/middleware/immer";

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
		execute: async () => {
			useStudioManager.setState((studio) => ({
				state: addWorkspace(studio.state),
			}));
		},
	}),
	"workspace:remove": createSpell({
		description: "Remove the active workspace",
		parameters: z.object({id: z.string().optional()}),
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
		execute: async ({id}) => {
			useStudioManager.setState((studio) => ({
				state: setActiveWorkspace(studio.state, id as `workspace_${string}`),
			}));
		},
	}),
	"window:split-horizontal": createSpell({
		description: "Split the focused window horizontally",
		parameters: z.void(),
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
		parameters: z.object({}),
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
		parameters: z.object({}),
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
		parameters: z.object({}),
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
		parameters: z.object({}),
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
		parameters: z.object({}),
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
		execute: async ({path}) => {
			useStudioManager.setState((studio) => {
				const workspace = getActiveWorkspace(studio.state);
				if (!workspace) return studio;
				studio.state.workspaces[workspace.id] = focusWindow(workspace, path);
			});
		},
	}),
});

export const spellbook = Spellbook.create()
	.command("workspace:create", {
		description: "Create a new workspace",
		input: z.void(),
		execute: async () => {
			useStudioManager.setState((studio) => ({
				state: addWorkspace(studio.state),
			}));
		},
	})
	.command("workspace:remove", {
		description: "Remove the active workspace",
		input: z.object({id: z.string().optional()}),
		execute: async ({input}) => {
			useStudioManager.setState((studio) => ({
				state: removeWorkspace(
					studio.state,
					(input?.id as `workspace_${string}`) ?? studio.state.activeWorkspace,
				),
			}));
		},
	})
	.command("workspace:set-active", {
		description: "Set the active workspace",
		meta: {hidden: true},
		input: z.object({id: z.string()}),
		execute: async ({input}) => {
			useStudioManager.setState((studio) => ({
				state: setActiveWorkspace(studio.state, input.id as `workspace_${string}`),
			}));
		},
	})
	// Split Commands
	.command("window:split-horizontal", {
		description: "Split the focused window horizontally",
		input: z.void(),
		execute: async () => {
			useStudioManager.setState((studio) => {
				const workspace = getActiveWorkspace(studio.state);
				if (!workspace) return studio;

				studio.state.workspaces[workspace.id] = splitWindow(workspace, "horizontal");
			});
		},
	})
	.command("window:split-vertical", {
		description: "Split the focused window vertically",
		input: z.void(),
		execute: async () => {
			useStudioManager.setState((studio) => {
				const workspace = getWorkspace(studio.state, studio.state.activeWorkspace);
				if (!workspace) return studio;

				studio.state.workspaces[workspace.id] = splitWindow(workspace, "vertical");
			});
		},
	})
	// Window Management Commands
	.command("window:close", {
		description: "Close the focused window",
		input: z.void(),
		execute: async () => {
			useStudioManager.setState((state) => {
				const workspace = getActiveWorkspace(state.state);
				if (!workspace) return state;

				state.state.workspaces[workspace.id] = removeWindow(workspace, workspace.focused);
				return state;
			});
		},
	})
	// Focus Commands
	.command("window:focus-left", {
		description: "Focus the window to the left",
		input: z.void(),
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
	})
	.command("window:focus-right", {
		description: "Focus the window to the right",
		input: z.void(),
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
	})
	.command("window:focus-up", {
		description: "Focus the window above",
		input: z.void(),
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
	})
	.command("window:focus-down", {
		description: "Focus the window below",
		input: z.void(),
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
	})
	.command("window:focus", {
		description: "Focus the window",
		meta: {hidden: true},
		input: z.object({path: z.array(z.number())}),
		execute: async ({input}) => {
			useStudioManager.setState((studio) => {
				const workspace = getActiveWorkspace(studio.state);
				if (!workspace) return studio;
				studio.state.workspaces[workspace.id] = focusWindow(workspace, input.path);
			});
		},
	})
	.build();
