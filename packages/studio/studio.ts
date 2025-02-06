import {factory} from "@umut/forge";
import {produce} from "immer";
import {type Workspace, createWorkspace} from "./workspace";

export const createStudio = factory(
	"studio",
	(initialWorkspace: Workspace = createWorkspace()) => ({
		workspaces: {[initialWorkspace.id]: initialWorkspace},
		activeWorkspace: initialWorkspace.id,
	}),
);

export type Studio = ReturnType<typeof createStudio>;

export function addWorkspace(studio: Studio) {
	return produce(studio, (draft) => {
		const workspace = createWorkspace();
		draft.workspaces[workspace.id] = workspace;
	});
}

export function removeWorkspace(studio: Studio, id: Workspace["id"]) {
	return produce(studio, (draft) => {
		delete draft.workspaces[id];
	});
}

export function setActiveWorkspace(studio: Studio, id: Workspace["id"]) {
	return produce(studio, (draft) => {
		if (id in draft.workspaces) {
			draft.activeWorkspace = id;
		}
	});
}

export function getWorkspace(studio: Studio, id: Workspace["id"]) {
	return studio.workspaces[id];
}

export function getActiveWorkspace(studio: Studio) {
	const workspace = getWorkspace(studio, studio.activeWorkspace);
	if (!workspace) {
		throw new Error(`Workspace ${studio.activeWorkspace} not found`);
	}

	return workspace;
}
