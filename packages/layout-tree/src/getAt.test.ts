import {describe, expect, it} from "bun:test";
import {createNode} from "./createNode";
import {createTree} from "./createTree";
import {getAt} from "./getAt";

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

describe("getAt", () => {
	it("returns the node at given index", () => {
		const node = getAt<{id: number}>(tree, 0);
		expect(node?.data.id).toEqual(0);
	});

	it("returns null when not found", () => {
		const node = getAt(tree, 10);
		expect(node).toEqual(null);
	});
});
