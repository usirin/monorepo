/**
 * @module layout-tree
 * A tree-based layout management system that handles window splitting, moving, and organization
 */

import {type Entity, factory} from "@usirin/forge";
import {produce} from "immer";
import get from "lodash.get";

/** Represents the orientation of a stack of windows */
export type Orientation = "horizontal" | "vertical";

/** Represents the direction of movement or splitting */
export type Direction = "left" | "right" | "up" | "down";

/**
 * Represents a window entity in the layout tree
 * @interface Window
 * @extends Entity<"window">
 */
export interface Window extends Entity<"window"> {
	/** Unique identifier for the window */
	key: string;
}

/**
 * Creates a new window instance
 * @param key - Unique identifier for the window
 * @returns A new Window entity
 */
export const createWindow = factory("window", (key: string) => ({
	key,
}));

/**
 * Creates a deep copy of a window
 * @param window - The window to clone
 * @returns A new Window instance with the same key
 */
export const clone = (window: Window) => createWindow(window.key);

/**
 * Represents a stack of windows or other stacks
 * @interface Stack
 * @extends Entity<"stack">
 */
export interface Stack extends Entity<"stack"> {
	/** The orientation of children within the stack */
	orientation: Orientation;
	/** Array of windows or nested stacks */
	children: (Window | Stack)[];
}

/**
 * Creates a new stack instance
 * @param orientation - The orientation of the stack ("horizontal" | "vertical")
 * @param children - Array of windows or nested stacks
 * @returns A new Stack entity
 */
export const createStack = factory(
	"stack",
	(orientation: Orientation, children: (Window | Stack)[]) => ({
		orientation,
		children,
	}),
);

/**
 * Represents the root layout tree structure
 * @interface Tree
 * @extends Entity<"tree">
 */
export interface Tree extends Entity<"tree"> {
	/** The root stack containing all windows and nested stacks */
	root: Stack;
}

/** Represents a path to a stack or window in the tree using array indices */
export type StackPath = number[];

/**
 * Creates a new layout tree
 * @param root - Optional root stack. If not provided, creates a default vertical stack with a scratch window
 * @returns A new Tree entity
 */
export const createTree = factory("tree", (root?: Stack) => ({
	root: root ?? createStack("vertical", [createWindow("scratch")]),
}));

/**
 * Retrieves a node at the specified path in the stack
 * @param stack - The stack to search in
 * @param stackPath - Array of indices representing the path to the desired node
 * @returns The found Stack/Window or null if not found
 */
export function getAt(stack: Stack, stackPath: StackPath): Stack | Window | null {
	if (stackPath.length === 0) return stack;
	const thing = get(
		stack,
		stackPath.flatMap((n) => ["children", n]),
	);

	return (thing as Stack | Window) ?? null;
}

/**
 * Removes and returns the last element of a stack path
 * @param stackPath - The path to modify
 * @returns Tuple of [removed index, remaining path]
 */
const pop = (stackPath: StackPath): [number | undefined, StackPath] => {
	const path = [...stackPath];
	return [path.pop() as number, path];
};

/**
 * Splits a window into two windows with the specified orientation
 * @param tree - The layout tree
 * @param path - Path to the window to split
 * @param orientation - Desired orientation of the split
 * @returns Updated Tree with the split window
 */
export function split(tree: Tree, path: StackPath, orientation: Orientation): Tree {
	return produce(tree, (draft) => {
		const node = getAt(draft.root, path);
		if (node?.tag !== "window") {
			return;
		}

		const {parent, index} = findParent(draft, path);
		if (!parent) {
			return;
		}

		let toBeInserted: (Window | Stack)[] = [];
		if (orientation !== parent.orientation) {
			// instead of creating a new stack, we can just change the orientation of the parent
			// if the parent has only one child
			if (parent.children.length === 1) {
				parent.orientation = orientation;
				parent.children = [node, clone(node)];
				return;
			}

			const newParent = createStack(orientation, [node, clone(node)]);
			toBeInserted = [newParent];
		} else {
			toBeInserted = [node, clone(node)];
		}

		parent.children.splice(index, 1, ...toBeInserted);
	});
}

/**
 * Updates a window's key
 * @param tree - The layout tree
 * @param path - Path to the window to update
 * @param key - New key for the window
 * @returns Updated Tree with the modified window
 */
export function updateWindow(tree: Tree, path: StackPath, key: string) {
	return produce(tree, (draft) => {
		const node = getAt(draft.root, path);
		if (node?.tag !== "window") {
			return;
		}

		node.key = key;
	});
}

/**
 * Removes a window or stack from the tree
 * @param tree - The layout tree
 * @param path - Path to the node to remove
 * @returns Updated Tree with the node removed
 */
export function remove(tree: Tree, path: StackPath): Tree {
	return produce(tree, (draft) => {
		const node = getAt(draft.root, path);
		if (!node) {
			return;
		}

		const {parent, index, path: parentPath} = findParent(draft, path);
		if (!parent) {
			return;
		}

		parent.children.splice(index, 1);

		if (parent.children.length === 0) {
			const {parent: grandParent, index: parentIndex} = findParent(draft, parentPath);
			if (!grandParent) {
				return;
			}

			grandParent.children.splice(parentIndex, 1);
		}
	});
}

/**
 * Moves a node before another node in the tree
 * @param tree - The layout tree
 * @param path - Path to the node to move
 * @param before - Path to the target position
 * @returns Updated Tree with the moved node
 */
export function moveBefore(tree: Tree, path: StackPath, before: StackPath) {
	return produce(tree, (draft) => {
		const node = getAt(draft.root, path);
		if (!node) {
			return;
		}

		const {parent, index} = findParent(draft, path);
		if (!parent) {
			return;
		}

		const beforeNode = getAt(draft.root, before);
		if (!beforeNode) {
			return;
		}

		const {parent: beforeParent, index: beforeIndex} = findParent(draft, before);
		if (!beforeParent) {
			return;
		}

		parent.children.splice(index, 1);
		beforeParent.children.splice(beforeIndex, 0, node);
	});
}

/**
 * Moves a node after another node in the tree
 * @param tree - The layout tree
 * @param path - Path to the node to move
 * @param after - Path to the target position
 * @returns Updated Tree with the moved node
 */
export function moveAfter(tree: Tree, path: StackPath, after: StackPath) {
	return produce(tree, (draft) => {
		const node = getAt(draft.root, path);
		if (!node) {
			return;
		}

		const {parent, index} = findParent(draft, path);
		if (!parent) {
			return;
		}

		const afterNode = getAt(draft.root, after);
		if (!afterNode) {
			return;
		}

		const {parent: afterParent, index: afterIndex} = findParent(draft, after);
		if (!afterParent) {
			return;
		}

		parent.children.splice(index, 1);
		afterParent.children.splice(afterIndex, 0, node);
	});
}

/**
 * Swaps the keys of two windows
 * @param tree - The layout tree
 * @param source - Path to the first window
 * @param target - Path to the second window
 * @returns Updated Tree with swapped windows
 */
export function swap(tree: Tree, source: StackPath, target: StackPath) {
	return produce(tree, (draft) => {
		const sourceWindow = getAt(draft.root, source);
		if (sourceWindow?.tag !== "window") {
			return;
		}

		const targetWindow = getAt(draft.root, target);
		if (targetWindow?.tag !== "window") {
			return;
		}

		const temp = sourceWindow.key;
		sourceWindow.key = targetWindow.key;
		targetWindow.key = temp;
	});
}

/**
 * Finds a window that matches the given predicate
 * @param tree - The layout tree
 * @param predicate - Function to test each window
 * @returns Matching Window or null if not found
 */
export function find(tree: Tree, predicate: (window: Window) => boolean): Window | null {
	function findInStack(stack: Stack) {
		for (const child of stack.children) {
			if (child.tag === "window" && predicate(child)) {
				return child;
			}

			if (child.tag === "stack") {
				return findInStack(child);
			}
		}

		return null;
	}

	return findInStack(tree.root);
}

/**
 * Finds the next sibling window in the specified direction
 * @param tree - The layout tree
 * @param path - Path to the current window
 * @param direction - Direction to search ("left" | "right" | "up" | "down")
 * @returns The found sibling Window or null
 */
export function findSibling(tree: Tree, path: StackPath, direction: Direction): Window | null {
	const orientation = orentationFromDirection(direction);
	const orientationParent = findParentWithOrientation(tree, path, orientation);
	if (!orientationParent) return null;

	const {parent, path: parentPath, index} = findParent(tree, path);
	if (!parent) return null;

	if (parent.orientation !== orientation) {
		return findSibling(tree, parentPath, direction);
	}

	const newIndex = getSiblingIndex(index, direction);

	if (newIndex < 0 || newIndex > parent.children.length - 1) {
		if (parentPath.length === 0) {
			return null;
		}

		return findSibling(tree, parentPath, direction);
	}

	return findChildWindow(parent, newIndex, direction);
}

const clamp = (num: number, lower: number, upper: number) => Math.min(Math.max(lower, num), upper);

function findChildWindow(stack: Stack, childIndex: number, direction: Direction): Window | null {
	const children = stack.children;
	const node = children[clamp(childIndex, 0, children.length - 1)];

	if (node.tag === "window") {
		return node;
	}

	const orientation = orentationFromDirection(direction);
	if (node.orientation !== orientation) {
		return findChildWindow(node, childIndex, direction);
	}

	return findChildWindow(node, isPrev(direction) ? children.length - 1 : 0, direction);
}

/**
 * Finds the parent stack and index of a node
 * @param tree - The layout tree
 * @param path - Path to the node
 * @returns Object containing parent stack, path, and index
 */
export function findParent(tree: Tree, path: StackPath) {
	const [nodeIndex, parentPath] = pop(path);
	if (nodeIndex == null) {
		return {parent: null, path: [], index: null};
	}

	return {parent: getAt(tree.root, parentPath) as Stack | null, path: parentPath, index: nodeIndex};
}

/**
 * Finds a parent stack with the specified orientation
 * @param tree - The layout tree
 * @param windowPath - Path to the current window
 * @param orientation - Desired orientation
 * @returns Matching Stack or null
 */
function findParentWithOrientation(
	tree: Tree,
	windowPath: StackPath,
	orientation: Orientation,
): Stack | null {
	const {parent, path: parentPath} = findParent(tree, windowPath);
	if (!parent) {
		return null;
	}

	if (parent.orientation === orientation) {
		return parent;
	}

	return findParentWithOrientation(tree, parentPath, orientation);
}

/**
 * Determines if a direction is "previous" (left/up)
 * @param direction - Direction to check
 * @returns boolean indicating if direction is previous
 */
const isPrev = (direction: Direction) => direction === "left" || direction === "up";

/**
 * Calculates the index of a sibling based on direction
 * @param index - Current index
 * @param direction - Direction to move
 * @returns New index
 */
const getSiblingIndex = (index: number, direction: Direction) =>
	isPrev(direction) ? index - 1 : index + 1;

/**
 * Determines if a direction is horizontal
 * @param direction - Direction to check
 * @returns boolean indicating if direction is horizontal
 */
const isHorizontalDirection = (direction: Direction) =>
	direction === "left" || direction === "right";

/**
 * Converts a direction to its corresponding orientation
 * @param direction - Direction to convert
 * @returns Corresponding Orientation
 */
const orentationFromDirection = (direction: Direction): Orientation =>
	isHorizontalDirection(direction) ? "vertical" : "horizontal";

/**
 * Finds the path to a window in the tree
 * @param tree - The layout tree
 * @param window - The window to find
 * @returns The path to the window or null if not found
 */
export function findWindowPath(tree: Tree, window: Window): StackPath | null {
	function findInStack(stack: Stack, path: StackPath = []): StackPath | null {
		for (let i = 0; i < stack.children.length; i++) {
			const child = stack.children[i];
			const childPath = [...path, i];

			if (child.tag === "window" && child.id === window.id) {
				return childPath;
			}

			if (child.tag === "stack") {
				const result = findInStack(child, childPath);
				if (result) {
					return result;
				}
			}
		}

		return null;
	}

	return findInStack(tree.root);
}
