import {beforeEach, describe, expect, it} from "bun:test";
import type {Orientation} from "./constants";
import {createNode} from "./createNode";
import {createTree} from "./createTree";
import {NodeType} from "./models/Node";
import type {Tree} from "./models/Tree";
import {split} from "./split";

describe("split", () => {
	it("returns the tree unchanged if there is not a node at given index", () => {
		const tree = createTree(createNode({data: {id: "root"}}));
		const newTree = split(tree, 5, "vertical");

		expect(newTree === tree).toBe(true);
	});

	it("splits an empty tree correctly", () => {
		const tree = createTree(createNode({data: {id: "root"}}));
		const newTree = split(tree, 0, "vertical");

		expect(newTree.root.children.length).toEqual(2);
		expect(newTree.root.children[0].parent).toBe(newTree.root);
		expect(newTree.root.children[1].parent).toBe(newTree.root);
	});

	describe("when root is vertically splitted", () => {
		let tree: Tree;
		beforeEach(() => {
			tree = createTree(
				createNode({
					data: {id: "root"},
					orientation: "vertical",
					children: [createNode({data: {id: 0}}), createNode({data: {id: 1}})],
				}),
			);
		});

		it("should have 3 children under root if split orientation is vertical", () => {
			const newTree = split(tree, 0, "vertical");
			expect((newTree.root.children[0].data as {id: number}).id).toBe(0);
			expect((newTree.root.children[1].data as {id: number}).id).toBe(0);
			expect((newTree.root.children[2].data as {id: number}).id).toBe(1);
		});

		it("should handle horizontal split", () => {
			const newTree = split(tree, 0, "horizontal");

			expect(newTree.root.orientation).toBe("vertical");
			expect(newTree.root.children.length).toBe(2);

			expect(newTree.root.children[0].type).toBe(NodeType.Parent);
		});
	});

	it("should handle complex splits", () => {
		const tree = createTree(
			createNode({
				data: {id: "root"},
				orientation: "vertical",
				children: [
					createNode({data: {id: 0}}),
					createNode({
						data: {id: "parent-0"},
						orientation: "horizontal",
						children: [
							createNode({data: {id: 1}}),
							createNode({data: {id: 2}}),
							createNode({data: {id: 3}}),
						],
					}),
					createNode({data: {id: 4}}),
					createNode({data: {id: 5}}),
				],
			}),
		);

		const newTree = split(tree, 2, "horizontal");
		expect(newTree.root.children[1].children.length).toBe(4);
	});
});
