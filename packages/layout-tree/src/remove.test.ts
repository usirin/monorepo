import {describe, expect, it} from "bun:test";
import {createNode} from "./createNode";
import {createTree} from "./createTree";
import {remove} from "./remove";

describe("remove", () => {
	describe("when there are more than 2 children", () => {
		it("works", () => {
			const tree = createTree(
				createNode({
					data: {id: "root"},
					orientation: "vertical",
					children: [
						createNode({data: {id: 0}}),
						createNode({data: {id: 1}}),
						createNode({data: {id: 2}}),
					],
				}),
			);

			const newTree = remove(tree, 1);
			expect(newTree.root.children.length).toEqual(2);
			expect(newTree.root.children[0].data).toEqual({id: 0});
			expect(newTree.root.children[1].data).toEqual({id: 2});
		});
	});

	describe("when there are 2 children", () => {
		it("should replace root with itself", () => {
			const tree = createTree(
				createNode({
					data: {id: "root"},
					orientation: "vertical",
					children: [createNode({data: {id: 0}}), createNode({data: {id: 1}})],
				}),
			);

			const newTree = remove(tree, 1);
			expect(newTree.root.data).toEqual({id: 0});
		});

		it("should replace parent with itself", () => {
			const tree = createTree(
				createNode({
					data: {id: "root"},
					orientation: "vertical",
					children: [
						createNode({
							data: {id: "0"},
							orientation: "vertical",
							children: [createNode({data: {id: "00"}}), createNode({data: {id: "01"}})],
						}),
						createNode({data: {id: "1"}}),
						createNode({data: {id: "2"}}),
					],
				}),
			);

			const newTree = remove(tree, 1);
			expect(newTree.root.children[0].data).toEqual({id: "00"});
		});
	});
});
