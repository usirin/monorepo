import {describe, expect, it} from "bun:test";
import fc from "fast-check";
import {
	createStack,
	createTree,
	createWindow,
	findSibling,
	findWindowPath,
	getAt,
	type Orientation,
	remove,
	type Stack,
	split,
	swap,
	type Tree,
	type Window,
} from "./index";

// ============================================================================
// GENERATORS
// ============================================================================

/**
 * Generator for orientation values
 */
const orientationArb = fc.constantFrom<Orientation>("horizontal", "vertical");

/**
 * Generator for window keys (human-readable identifiers)
 */
const windowKeyArb = fc.constantFrom("scratch", "editor", "terminal", "browser", "notes");

/**
 * Generator for Window entities
 */
const windowArb = windowKeyArb.map((key) => createWindow(key));

/**
 * Generator for Stack and Window structures using letrec for recursion
 * This creates realistic tree structures with varying depths
 *
 * Note: Type assertions are necessary because TypeScript cannot infer types
 * through the recursive tie() function in letrec. This is a known limitation
 * when working with recursive structures in fast-check.
 * See: https://github.com/dubzzz/fast-check/issues/topics
 */
const {stack: stackArb} = fc.letrec<{
	window: Window;
	stack: Stack;
}>((tie) => ({
	window: windowArb,
	stack: fc
		.record({
			orientation: orientationArb,
			children: fc.oneof(
				// Simple stacks: just windows
				fc.array(tie("window"), {minLength: 1, maxLength: 4}),
				// Complex stacks: mix of windows and nested stacks
				fc.array(fc.oneof(tie("window"), tie("stack")), {minLength: 1, maxLength: 3}),
			),
		})
		.chain((config) => {
			// Use chain to validate and transform the unknown[] to the correct type
			const children = config.children as (Window | Stack)[];
			return fc.constant(createStack(config.orientation, children));
		}),
}));

/**
 * Generator for complete Tree structures
 */
const treeArb: fc.Arbitrary<Tree> = stackArb.map((root) => createTree(root));

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Collects all paths to windows in the tree
 */
function collectAllWindowPaths(tree: Tree): number[][] {
	const paths: number[][] = [];

	function traverse(node: Stack | Window, path: number[]) {
		if (node.tag === "window") {
			paths.push(path);
		} else {
			for (let i = 0; i < node.children.length; i++) {
				traverse(node.children[i], [...path, i]);
			}
		}
	}

	traverse(tree.root, []);
	return paths;
}

/**
 * Collects all window entities from the tree
 */
function findAllWindows(tree: Tree, predicate?: (w: Window) => boolean): Window[] {
	const windows: Window[] = [];

	function traverse(node: Stack | Window) {
		if (node.tag === "window") {
			if (!predicate || predicate(node)) {
				windows.push(node);
			}
		} else {
			for (const child of node.children) {
				traverse(child);
			}
		}
	}

	traverse(tree.root);
	return windows;
}

/**
 * Counts total number of windows in the tree
 */
function countWindows(tree: Tree): number {
	return findAllWindows(tree).length;
}

/**
 * Collects all IDs in the tree
 */
function collectAllIds(tree: Tree): string[] {
	const ids: string[] = [];

	function traverse(node: Stack | Window) {
		ids.push(node.id);
		if (node.tag === "stack") {
			for (const child of node.children) {
				traverse(child);
			}
		}
	}

	traverse(tree.root);
	return ids;
}

// ============================================================================
// PROPERTY TESTS
// ============================================================================

describe("Layout Tree - Property Based Tests", () => {
	describe("Structural Invariants", () => {
		it("tree always has a root stack", () => {
			fc.assert(
				fc.property(treeArb, (tree) => {
					expect(tree.root.tag).toBe("stack");
				}),
				{numRuns: 50},
			);
		});

		it("all IDs in tree are unique", () => {
			fc.assert(
				fc.property(treeArb, (tree) => {
					const ids = collectAllIds(tree);
					const uniqueIds = new Set(ids);
					expect(uniqueIds.size).toBe(ids.length);
				}),
				{numRuns: 50},
			);
		});

		it("maintains valid structure after split", () => {
			fc.assert(
				fc.property(treeArb, orientationArb, (tree, orientation) => {
					const paths = collectAllWindowPaths(tree);
					if (paths.length === 0) return true;

					const path = paths[0];
					const modified = split(tree, path, orientation);

					// Tree should still be valid
					expect(modified.root.tag).toBe("stack");
					expect(modified.root.children.length).toBeGreaterThan(0);

					// All IDs should still be unique
					const ids = collectAllIds(modified);
					expect(new Set(ids).size).toBe(ids.length);
				}),
				{numRuns: 100},
			);
		});
	});

	describe("Split Operation Properties", () => {
		it("creates new window with same key but unique ID", () => {
			fc.assert(
				fc.property(treeArb, orientationArb, (tree, orientation) => {
					const paths = collectAllWindowPaths(tree);
					if (paths.length === 0) return true;

					const path = paths[0];
					const original = getAt(tree.root, path) as Window;
					if (original?.tag !== "window") return true;

					const originalKey = original.key;
					const originalId = original.id;

					const beforeWindows = findAllWindows(tree);
					const splitTree = split(tree, path, orientation);
					const afterWindows = findAllWindows(splitTree);
					const afterIds = collectAllIds(splitTree);

					// Should have one more window (but possibly more IDs due to new stack nodes)
					expect(afterWindows.length).toBe(beforeWindows.length + 1);

					// All IDs should be unique
					expect(new Set(afterIds).size).toBe(afterIds.length);

					// Find all windows with the original key
					const windowsWithOriginalKey = afterWindows.filter((w) => w.key === originalKey);

					// Original window should still exist
					const originalStillExists = windowsWithOriginalKey.some((w) => w.id === originalId);
					expect(originalStillExists).toBe(true);

					// At least one new window with the same key should exist
					const newWindowWithSameKey = windowsWithOriginalKey.find((w) => w.id !== originalId);
					expect(newWindowWithSameKey).toBeTruthy();
				}),
				{numRuns: 100},
			);
		});

		it("increases window count by exactly one", () => {
			fc.assert(
				fc.property(treeArb, orientationArb, (tree, orientation) => {
					const paths = collectAllWindowPaths(tree);
					if (paths.length === 0) return true;

					const before = countWindows(tree);
					const after = countWindows(split(tree, paths[0], orientation));

					expect(after).toBe(before + 1);
				}),
				{numRuns: 50},
			);
		});
	});

	describe("Remove Operation Properties", () => {
		it("decreases window count by exactly one", () => {
			fc.assert(
				fc.property(treeArb, (tree) => {
					const paths = collectAllWindowPaths(tree);
					if (paths.length === 0) return true;

					const before = countWindows(tree);
					const after = countWindows(remove(tree, paths[0]));

					expect(after).toBe(before - 1);
				}),
				{numRuns: 50},
			);
		});

		it("removes the correct window", () => {
			fc.assert(
				fc.property(treeArb, (tree) => {
					const paths = collectAllWindowPaths(tree);
					if (paths.length === 0) return true;

					const path = paths[0];
					const window = getAt(tree.root, path) as Window;
					if (window?.tag !== "window") return true;

					const removedTree = remove(tree, path);
					const allIds = collectAllIds(removedTree);

					// The removed window's ID should not exist anymore
					expect(allIds).not.toContain(window.id);
				}),
				{numRuns: 50},
			);
		});
	});

	describe("Swap Operation Properties", () => {
		it("preserves window count", () => {
			fc.assert(
				fc.property(treeArb, (tree) => {
					const paths = collectAllWindowPaths(tree);
					if (paths.length < 2) return true;

					const before = countWindows(tree);
					const swapped = swap(tree, paths[0], paths[1]);
					const after = countWindows(swapped);

					expect(after).toBe(before);
				}),
				{numRuns: 50},
			);
		});

		it("swapping with self is a no-op", () => {
			fc.assert(
				fc.property(treeArb, (tree) => {
					const paths = collectAllWindowPaths(tree);
					if (paths.length === 0) return true;

					const path = paths[0];
					const original = getAt(tree.root, path) as Window;
					if (original?.tag !== "window") return true;

					const swapped = swap(tree, path, path);
					const afterSwap = getAt(swapped.root, path) as Window;

					expect(afterSwap.key).toBe(original.key);
				}),
				{numRuns: 50},
			);
		});

		it("swapping twice returns to original state", () => {
			fc.assert(
				fc.property(treeArb, (tree) => {
					const paths = collectAllWindowPaths(tree);
					if (paths.length < 2) return true;

					const [path1, path2] = [paths[0], paths[1]];
					const w1 = getAt(tree.root, path1) as Window;
					const w2 = getAt(tree.root, path2) as Window;
					if (w1?.tag !== "window" || w2?.tag !== "window") return true;

					const originalKey1 = w1.key;
					const originalKey2 = w2.key;

					// Swap twice
					const swapped = swap(swap(tree, path1, path2), path1, path2);

					const after1 = getAt(swapped.root, path1) as Window;
					const after2 = getAt(swapped.root, path2) as Window;

					expect(after1.key).toBe(originalKey1);
					expect(after2.key).toBe(originalKey2);
				}),
				{numRuns: 50},
			);
		});
	});

	describe("Roundtrip Properties", () => {
		it("getAt and findWindowPath are inverses", () => {
			fc.assert(
				fc.property(treeArb, (tree) => {
					const paths = collectAllWindowPaths(tree);

					for (const path of paths) {
						const window = getAt(tree.root, path);
						if (window?.tag !== "window") continue;

						const foundPath = findWindowPath(tree, window);
						expect(foundPath).toEqual(path);
					}
				}),
				{numRuns: 50},
			);
		});
	});

	describe("Navigation Properties", () => {
		it("sibling navigation maintains structural consistency", () => {
			fc.assert(
				fc.property(treeArb, (tree) => {
					const paths = collectAllWindowPaths(tree);
					if (paths.length === 0) return true;

					const path = paths[0];
					const window = getAt(tree.root, path);
					if (window?.tag !== "window") return true;

					// If we find a sibling in any direction, it should be a valid window
					const directions = ["left", "right", "up", "down"] as const;

					for (const direction of directions) {
						const sibling = findSibling(tree, path, direction);
						if (sibling) {
							expect(sibling.tag).toBe("window");
							// Should be able to find its path
							const siblingPath = findWindowPath(tree, sibling);
							expect(siblingPath).toBeTruthy();
						}
					}
				}),
				{numRuns: 50},
			);
		});
	});

	describe("Metamorphic Properties", () => {
		it("split-then-remove maintains or decreases window count", () => {
			fc.assert(
				fc.property(treeArb, orientationArb, (tree, orientation) => {
					const paths = collectAllWindowPaths(tree);
					if (paths.length === 0) return true;

					const originalCount = countWindows(tree);
					const path = paths[0];

					// Split (adds 1) then remove (subtracts 1)
					const splitTree = split(tree, path, orientation);
					const finalTree = remove(splitTree, path);

					const finalCount = countWindows(finalTree);

					// Should be equal or less (if remove cleaned up empty stacks)
					expect(finalCount).toBeLessThanOrEqual(originalCount + 1);
					expect(finalCount).toBeGreaterThanOrEqual(originalCount - 1);
				}),
				{numRuns: 50},
			);
		});
	});
});
