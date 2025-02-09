import {factory} from "@umut/forge";
import {enableMapSet, produce} from "immer";
import type {Workspace} from "./workspace";

enableMapSet();

export const createRegistry = factory("ws_registry", () => {
	return {
		workspaces: new Set<Workspace["id"]>(),
	};
});

export type WorkspaceRegistry = ReturnType<typeof createRegistry>;

export function registerWorkspace(registry: WorkspaceRegistry, id: Workspace["id"]) {
	return produce(registry, (draft) => {
		draft.workspaces.add(id);
	});
}

export function unregisterWorkspace(registry: WorkspaceRegistry, id: Workspace["id"]) {
	return produce(registry, (draft) => {
		draft.workspaces.delete(id);
	});
}
