/**
 * @module workspace
 * A module for managing workspace state and operations
 */

import {factory} from "@usirin/forge";
import * as Layout from "@usirin/layout-tree";
import {produce} from "immer";

/**
 * Creates a new workspace with default state
 * @returns A new workspace instance
 */
export const createWorkspace = factory("workspace", () => ({
	layout: Layout.createTree(Layout.createStack("vertical", [Layout.createWindow("scratch")])),
	focused: [0],
}));

export type Workspace = ReturnType<typeof createWorkspace>;

/**
 * Updates the focused window path in a workspace
 * @param workspace - The workspace to update
 * @param path - The new focused path
 * @returns Updated workspace
 */
export function focusWindow(workspace: Workspace, path: Layout.StackPath): Workspace {
	return produce(workspace, (draft) => {
		draft.focused = path;
	});
}

/**
 * Splits a window in the workspace
 * @param workspace - The workspace to update
 * @param orientation - The split orientation
 * @param path - Path to the window to split. If not provided, uses focused window
 * @returns Updated workspace
 */
export function splitWindow(
	workspace: Workspace,
	orientation: Layout.Orientation,
	path?: Layout.StackPath,
): Workspace {
	return produce(workspace, (draft) => {
		const targetPath = path ?? draft.focused;
		draft.layout = Layout.split(draft.layout, targetPath, orientation);

		// After split, check if the target path now points to a stack
		const node = Layout.getAt(draft.layout.root, targetPath);
		if (node?.tag === "stack") {
			draft.focused = [...targetPath, 0];
		}
	});
}

/**
 * Updates a window's key in the workspace
 * @param workspace - The workspace to update
 * @param path - Path to the window
 * @param key - New key for the window
 * @returns Updated workspace
 */
export function updateWindow(workspace: Workspace, path: Layout.StackPath, key: string): Workspace {
	return produce(workspace, (draft) => {
		draft.layout = Layout.updateWindow(draft.layout, path, key);
	});
}

/**
 * Removes a window from the workspace
 * @param workspace - The workspace to update
 * @param path - Path to the window to remove
 * @returns Updated workspace
 */
export function removeWindow(workspace: Workspace, path: Layout.StackPath): Workspace {
	return produce(workspace, (draft) => {
		draft.layout = Layout.remove(draft.layout, path);
	});
}

/**
 * Moves a window before another window
 * @param workspace - The workspace to update
 * @param path - Path to the window to move
 * @param before - Path to the target position
 * @returns Updated workspace
 */
export function moveWindowBefore(
	workspace: Workspace,
	path: Layout.StackPath,
	before: Layout.StackPath,
): Workspace {
	return produce(workspace, (draft) => {
		draft.layout = Layout.moveBefore(draft.layout, path, before);
	});
}

/**
 * Moves a window after another window
 * @param workspace - The workspace to update
 * @param path - Path to the window to move
 * @param after - Path to the target position
 * @returns Updated workspace
 */
export function moveWindowAfter(
	workspace: Workspace,
	path: Layout.StackPath,
	after: Layout.StackPath,
): Workspace {
	return produce(workspace, (draft) => {
		draft.layout = Layout.moveAfter(draft.layout, path, after);
	});
}

/**
 * Gets a window at the specified path in the workspace
 * @param workspace - The workspace to check
 * @param path - Path to the window
 * @returns The window at the path or null if not found
 */
export function getWindowAt(workspace: Workspace, path: Layout.StackPath): Layout.Window | null {
	const node = Layout.getAt(workspace.layout.root, path);
	return node?.tag === "window" ? node : null;
}
