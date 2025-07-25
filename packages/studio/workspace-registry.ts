import {factory, type Ref} from "@usirin/forge";
import {enableMapSet, produce} from "immer";
import type {Workspace} from "./workspace";

enableMapSet();

export const createRegistry = factory("ws_registry", () => {
	return {
		workspaces: new Set<Ref<Workspace>>(),
	};
});

export type WorkspaceRegistry = ReturnType<typeof createRegistry>;

export function registerWorkspace(registry: WorkspaceRegistry, id: Ref<Workspace>) {
	return produce(registry, (draft) => {
		draft.workspaces.add(id);
	});
}

export function unregisterWorkspace(registry: WorkspaceRegistry, id: Ref<Workspace>) {
	return produce(registry, (draft) => {
		draft.workspaces.delete(id);
	});
}
