import type {Direction, Orientation} from "./constants";
import type {Node} from "./models/Node";

export const findSibling = <T = unknown>(
	node: Node<T>,
	direction: Direction,
	relativeIndex?: number,
	initialNode = node,
): Node<T> | null => {
	const orientation = getOrientation(direction);
	const parent = findParentWithOrientation(node, orientation) as Node<T> | null;

	if (!parent) return initialNode;

	if (parent !== node.parent) {
		const next = node.parent as Node<T>;
		const index = relativeIndex ?? next.indexOf(node);
		return findSibling(next, direction, index, initialNode);
	}

	const childIndex = parent.indexOf(node);
	const childrenLength = parent.children.length;
	const newIndex = getSiblingIndex(direction, childIndex);

	if (newIndex < 0 || newIndex > childrenLength - 1) {
		return isRoot(parent)
			? initialNode
			: findSibling(parent, direction, relativeIndex, initialNode);
	}

	return findChild(parent, orientation, direction, newIndex, relativeIndex);
};

const findParentWithOrientation = (node: Node, orientation: Orientation): Node | null => {
	if (!node.parent) return null;

	if (node.parent.orientation === orientation) {
		return node.parent;
	}

	return findParentWithOrientation(node.parent, orientation);
};

const findChild = <T>(
	parent: Node<T>,
	orientation: Orientation,
	direction: Direction,
	index: number,
	relativeIndex = 0,
): Node<T> | null => {
	const children = parent.children;
	const node = children[clamp(index, 0, children.length - 1)] as Node<T>;

	// we found the child we are looking for
	if (isLeaf(node)) return node;

	let childIndex: number;
	if (node.orientation === orientation) {
		childIndex = isGoingBack(direction) ? children.length - 1 : 0;
	} else {
		childIndex = Math.round(relativeIndex * children.length);
	}

	return findChild(node, orientation, direction, childIndex, relativeIndex);
};

const isRoot = (node: Node) => !node.parent;

const isLeaf = (node: Node) => node.children.length === 0;

const isGoingBack = (direction: Direction) => ["left", "up"].includes(direction);

const clamp = (num: number, lower: number, upper: number) => Math.min(Math.max(lower, num), upper);

const getOrientation = (direction: Direction) =>
	["up", "down"].includes(direction) ? "horizontal" : "vertical";

const getSiblingIndex = (direction: Direction, index: number) =>
	isGoingBack(direction) ? index - 1 : index + 1;
