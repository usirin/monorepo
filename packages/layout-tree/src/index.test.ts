import {describe, expect, it} from "bun:test";
import {
	createStack,
	createTree,
	createWindow,
	findSibling,
	getAt,
	remove,
	type Stack,
	split,
	type Window,
} from "./index";

describe("getAt", () => {
	it("should return the node at the given path", () => {
		const tree = createTree();

		const result = getAt(tree.root, [0]);
		expect(result).toEqual(tree.root.children[0]);
	});

	it("should return itself", () => {
		const tree = createTree();

		const result = getAt(tree.root, []);
		expect(result).toBe(tree.root);
	});
});

describe("split", () => {
	it("should split root vertically", () => {
		const tree = createTree();
		let newTree = split(tree, [0], "vertical");
		expect(newTree.root.children.length).toBe(2);

		expect(newTree.root.children[0].tag).toBe("window");
		expect(newTree.root.children[1].tag).toBe("window");

		newTree = split(newTree, [0], "horizontal");
		expect(newTree.root.children.length).toBe(2);
		expect(newTree.root.children[0].tag).toBe("stack");
		expect(newTree.root.children[1].tag).toBe("window");
	});

	it("should split root horizontally", () => {
		const tree = createTree();
		const newTree = split(tree, [0], "horizontal");
		expect(newTree.root.children.length).toBe(2);
		expect(newTree.root.children[0].tag).toBe("window");
		expect(newTree.root.children[1].tag).toBe("window");

		const verticalSplit = split(newTree, [1], "vertical");
		expect(verticalSplit.root.children.length).toBe(2);
		expect(verticalSplit.root.children[0].tag).toBe("window");
		expect(verticalSplit.root.children[1].tag).toBe("stack");

		expect(verticalSplit.root.children[0]).toBe(newTree.root.children[0]);
	});
});

describe("findSibling", () => {
	it("should find the right sibling in a vertical stack", () => {
		const tree = createTree();
		tree.root = createStack("vertical", [createWindow("1"), createWindow("2"), createWindow("3")]);

		const result = findSibling(tree, [0], "right");
		expect(result?.key).toEqual("2");
	});

	it("should find the left sibling in a vertical stack", () => {
		const tree = createTree();
		tree.root = createStack("vertical", [createWindow("1"), createWindow("2"), createWindow("3")]);

		const result = findSibling(tree, [1], "left");
		expect(result?.key).toEqual("1");
	});

	it("should find the down sibling in a horizontal stack", () => {
		const tree = createTree();
		tree.root = createStack("horizontal", [
			createWindow("1"),
			createWindow("2"),
			createWindow("3"),
		]);

		const result = findSibling(tree, [0], "down");
		expect(result?.key).toEqual("2");
	});

	it("should find the up sibling in a horizontal stack", () => {
		const tree = createTree();
		tree.root = createStack("horizontal", [
			createWindow("1"),
			createWindow("2"),
			createWindow("3"),
		]);

		const result = findSibling(tree, [1], "up");
		expect(result?.key).toEqual("1");
	});

	it("should return null when there is no sibling in the given direction", () => {
		const tree = createTree();
		tree.root = createStack("vertical", [createWindow("1"), createWindow("2")]);

		const result = findSibling(tree, [0], "left");
		expect(result).toBe(null);
	});

	it("should find sibling in nested stacks", () => {
		const tree = createTree();
		tree.root = createStack("horizontal", [
			createStack("vertical", [createWindow("1"), createWindow("2")]),
			createWindow("3"),
			createStack("vertical", [createWindow("4"), createWindow("5")]),
		]);

		const result = findSibling(tree, [0, 1], "down");
		expect(result?.key).toEqual("3");
	});

	it("should return null when reaching the edge of the tree", () => {
		const tree = createTree(
			createStack("horizontal", [
				createStack("vertical", [createWindow("1"), createWindow("2")]),
				createWindow("3"),
			]),
		);

		const result = findSibling(tree, [1], "down");
		expect(result).toBe(null);
	});
});

describe("remove", () => {
	it("should remove a window from a stack", () => {
		const tree = createTree();
		tree.root = createStack("vertical", [createWindow("0"), createWindow("1"), createWindow("2")]);

		const newTree = remove(tree, [1]);
		expect(newTree.root.children.length).toEqual(2);
		expect((newTree.root.children[0] as Window).key).toEqual("0");
		expect((newTree.root.children[1] as Window).key).toEqual("2");
	});

	it("should work with only one window", () => {
		const tree = createTree();

		const newTree = remove(tree, [0]);
		expect(newTree.root.children.length).toEqual(0);
	});

	it("should work well with nested complex trees", () => {
		const tree = createTree();
		tree.root = createStack("vertical", [
			createStack("horizontal", [createWindow("1"), createWindow("2")]),
			createWindow("3"),
		]);

		const newTree = remove(tree, [0, 0]);
		expect((newTree.root.children[0] as Stack).children.length).toEqual(1);
		expect(((newTree.root.children[0] as Stack).children[0] as Window).key).toEqual("2");
		expect((newTree.root.children[1] as Window).key).toEqual("3");

		const newTree2 = remove(newTree, [0, 0]);
		expect(newTree2.root.children.length).toEqual(1);
		expect((newTree2.root.children[0] as Window).key).toEqual("3");
	});
});
