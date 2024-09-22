import type {Node} from "./models/Node";
import {Tree} from "./models/Tree";

export const createTree = <T extends Node>(root: T): Tree<T> => {
	return new Tree(root);
};
