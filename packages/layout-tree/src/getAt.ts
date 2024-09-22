import type { Node } from "./models/Node";
import type { Tree } from "./models/Tree";

export const traverse = <T extends Node>(
  root: T,
  traverser: (node: T, index: number) => undefined | boolean
) => {
  let index = 0;

  const traverseChildren = (node: T): boolean | undefined => {
    for (const child of node.children as T[]) {
      if (traverseChildren(child) === false) {
        return false;
      }
    }
    return traverser(node, index++);
  };

  traverseChildren(root);
};

export const getAt = <T extends Node>(
  tree: Tree<T>,
  index: number
): T | null => {
  let result: T | null = null;

  traverse(tree.root, (node, i) => {
    if (i === index) {
      result = node;
      return false; // Stop traversal
    }
  });

  return result;
};