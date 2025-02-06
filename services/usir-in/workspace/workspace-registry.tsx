import {id} from "@umut/forge";
import type {Orientation, StackPath} from "@umut/layout-tree";
import {type Workspace, createWorkspace, focusWindow, splitWindow} from "@umut/studio/workspace";
import {create} from "zustand";
import {createJSONStorage, devtools, persist} from "zustand/middleware";
import {immer} from "zustand/middleware/immer";

/** Represents a unique identifier for a workspace registry entry */
export type WorkspaceID = Workspace["id"];

interface RegistryState {
	workspaces: Record<WorkspaceID, Workspace>;
	activeID: WorkspaceID;
}

interface RegistryStore extends RegistryState {
	unregisterWorkspace: (id: WorkspaceID) => void;
	setActiveWorkspace: (id: WorkspaceID) => void;
	focusWindow: (id: WorkspaceID, path: StackPath) => void;
	splitFocusedWindow: (id: WorkspaceID, orientation: Orientation) => void;
}

const DEFAULT_WORKSPACE_ID = id("workspace") as WorkspaceID;

// Registry Store
export const useRegistry = create<RegistryStore>()(
	devtools(
		persist(
			immer((set) => ({
				workspaces: {
					[DEFAULT_WORKSPACE_ID]: createWorkspace(),
				},
				activeID: DEFAULT_WORKSPACE_ID,
				registerWorkspace: () => {
					set((state) => {
						const workspace = createWorkspace();
						state.workspaces[workspace.id] = workspace;

						// If this is the first workspace, make it active
						if (state.activeID === null) {
							state.activeID = workspace.id;
						}
					});
				},
				unregisterWorkspace: (id) =>
					set((state) => {
						if (!state.workspaces[id]) return;

						// If we're removing the active workspace, switch to another one first
						if (state.activeID === id) {
							const remainingIDs = Object.keys(state.workspaces).filter(
								(wid) => wid !== id,
							) as WorkspaceID[];
							state.activeID = remainingIDs[0];
						}

						delete state.workspaces[id];
					}),
				setActiveWorkspace: (id) =>
					set((state) => {
						if (state.workspaces[id]) {
							state.activeID = id;
						}
					}),
				focusWindow: (id, path) =>
					set((state) => {
						if (!state.workspaces[id]) return;
						state.workspaces[id] = focusWindow(state.workspaces[id], path);
					}),
				splitFocusedWindow: (id, orientation) =>
					set((state) => {
						if (!state.workspaces[id]) return;
						const workspace = state.workspaces[id];
						state.workspaces[id] = splitWindow(workspace, orientation, workspace.focused);
					}),
			})),
			{
				name: "workspace-registry",
				storage: createJSONStorage(() => localStorage),
				partialize: (state) => ({
					workspaces: state.workspaces,
					activeID: state.activeID,
				}),
			},
		),
	),
);

export const useWorkspaceByID = (id: WorkspaceID) => useRegistry((state) => state.workspaces[id]);

export const useActiveWorkspace = () => {
	const {activeID, workspaces} = useRegistry();
	if (!activeID) {
		throw new Error("No active workspace");
	}
	return workspaces[activeID];
};
