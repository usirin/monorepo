import type {Node} from "./Node";

export class Tree<T extends Node = Node> {
	public root: T;

	constructor(root: T) {
		this.root = root;
	}
}
