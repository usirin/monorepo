import {produce} from "immer";
import {type Entity, entity, factory, id} from "./entity";

export type Orientation = "horizontal" | "vertical";
export type Direction = "left" | "right" | "up" | "down";

export interface Window extends Entity<"window"> {
	key: string;
}

export const createWindow = factory("window", (key: string) => {
	return {
		key,
	};
});
export const clone = (window: Window) => createWindow(window.key);

export interface Stack extends Entity<"stack"> {
	orientation: Orientation;
	children: (Window | Stack)[];
}

export const createStack = (orientation: Orientation, children: (Window | Stack)[]) => ({
	...entity("stack"),
	orientation,
	children,
});

const stack = factory("stack", (orientation: Orientation, children: (Window | Stack)[]) => ({
	orientation,
	children,
}));

export interface Tree extends Entity<"tree"> {
	root: Stack;
}

export type StackPath = number[];

export const createTree = (root?: Stack): Tree => ({
	...entity("tree"),
	root: root ?? createStack("vertical", [createWindow("scratch")]),
});

export function getAt(stack: Stack, stackPath: StackPath): Stack | Window | null {
	let node = stack;
	const path = [...stackPath];
	while (path.length > 0) {
		if (node.tag !== "stack") {
			throw new Error("Invalid path");
		}

		const index = path.shift() as number;
		if (index === undefined) {
			return null;
		}
		node = node.children[index] as Stack;
	}
	return node as Stack | Window;
}

const pop = (stackPath: StackPath): [number | undefined, StackPath] => {
	const path = [...stackPath];
	return [path.pop() as number, path];
};

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
				parent.id = id("stack");
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

export function updateWindow(tree: Tree, path: StackPath, key: string) {
	return produce(tree, (draft) => {
		const node = getAt(draft.root, path);
		if (node?.tag !== "window") {
			return;
		}

		node.key = key;
	});
}

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

export function swap(tree: Tree, path: StackPath, withPath: StackPath) {
	return produce(tree, (draft) => {
		const node = getAt(draft.root, path);
		if (node?.tag !== "window") {
			return;
		}

		const withNode = getAt(draft.root, withPath);
		if (withNode?.tag !== "window") {
			return;
		}

		const temp = node.key;
		node.key = withNode.key;
		withNode.key = temp;
	});
}

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

export function findParent(tree: Tree, path: StackPath) {
	const [nodeIndex, parentPath] = pop(path);
	if (nodeIndex == null) {
		return {parent: null, path: [], index: null};
	}

	return {parent: getAt(tree.root, parentPath) as Stack | null, path: parentPath, index: nodeIndex};
}

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

const isPrev = (direction: Direction) => direction === "left" || direction === "up";
const getSiblingIndex = (index: number, direction: Direction) =>
	isPrev(direction) ? index - 1 : index + 1;

const isHorizontal = (direction: Direction) => direction === "left" || direction === "right";

const orentationFromDirection = (direction: Direction): Orientation =>
	isHorizontal(direction) ? "horizontal" : "vertical";
