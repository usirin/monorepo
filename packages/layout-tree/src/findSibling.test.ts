import {describe, expect, it} from "bun:test";
import assert from "node:assert";

import type {Node} from "./models/Node";
import {createNode} from "./createNode";
import {createTree} from "./createTree";
import {getAt} from "./getAt";
import {findSibling} from "./findSibling";

const p = createNode;
const n = <T extends string | number>(meta: T) => createNode<T>({data: meta});

/*
  *---------*---------*---------*---------*
  |         |         |         |         |
  |         |    1    |         |         |
  |         |         |         |         |
  *         *---------*         *         *
  |         |         |         |         |
  |    0    |    2    |    4    |    5    |
  |         |         |         |         |
  *         *---------*         *         *
  |         |         |         |         |
  |         |    3    |         |         |
  |         |         |         |         |
  *---------*---------*---------*---------*
*/
const simpleTree = createTree<Node<string | {id: string}>>(
	createNode({
		data: {id: "root"},
		orientation: "vertical",
		children: [
			createNode({data: "0"}),
			createNode({
				data: {id: "parent-0"},
				orientation: "horizontal",
				children: [createNode({data: "1"}), createNode({data: "2"}), createNode({data: "3"})],
			}),
			createNode({data: "4"}),
			createNode({data: "5"}),
		],
	}),
);

// interface Noodle {
//   key: string;
//   parent?: Noodle;
//   children: Noodle[];
// }

const complexTree = createTree<Node<string | {id: string}>>(
	p({
		data: {id: "_root"},
		orientation: "horizontal",
		children: [
			p({
				data: {id: "0"},
				orientation: "vertical",
				children: [
					n("00"),
					p({
						data: {id: "01"},
						orientation: "horizontal",
						children: [n("010"), n("011")],
					}),
				],
			}),
			p({
				data: {id: "1"},
				orientation: "vertical",
				children: [
					n("10"),
					p({
						data: {id: "11"},
						orientation: "horizontal",
						children: [
							p({
								data: {id: "110"},
								orientation: "vertical",
								children: [n("1100"), n("1101")],
							}),
							n("111"),
							p({
								data: {id: "112"},
								orientation: "vertical",
								children: [
									n("1120"),
									p({
										data: {id: "1121"},
										orientation: "horizontal",
										children: [n("11210"), n("11211")],
									}),
								],
							}),
						],
					}),
					p({
						data: {id: "12"},
						orientation: "horizontal",
						children: [
							n("120"),
							p({
								data: {id: "121"},
								orientation: "vertical",
								children: [n("1210"), n("1211")],
							}),
						],
					}),
				],
			}),
		],
	}),
);
// const jsonTree = [0, [1, 2, 3], 4, 5];

describe("with relatively simple tree", () => {
	it("should return sibling of given direction", () => {
		const node = getAt(simpleTree, 2);
		assert(node, "Node should exist");
		const sibling = findSibling(node, "up");
		expect(sibling?.data).toEqual("1");
	});

	it("should return itself if there is no sibling of given direction", () => {
		const node = getAt(simpleTree, 0);
		assert(node, "Node should exist");
		let sibling = findSibling(node, "up");
		expect(sibling?.data).toEqual("0");
		sibling = findSibling(node, "left");
		expect(sibling?.data).toEqual("0");
	});

	it("should handle a complex movement where parent orientation is different than direction", () => {
		const node = getAt(simpleTree, 0);
		assert(node, "Node should exist");
		const sibling = findSibling(node, "left");
		expect(sibling?.data).toEqual("0");
	});

	it("should choose relative index on ambiguous finds", () => {
		const node = getAt(simpleTree, 0);
		assert(node, "Node should exist");
		const sibling = findSibling(node, "right");
		expect(sibling?.data).toEqual("1");
	});
});

/*
  *---------*---------*---------*---------*---------*
  |                   |                             |
  |                   |             010             |
  |                   |                             |
  *        00         *---------*---------*---------*
  |                   |                             |
  |                   |             011             |
  |                   |                             |
  *---------*---------*---------*---------*---------*
  |         |         |         |                   |
  |         |         |         |                   |
  |         |         |         |                   |
  *         *  1100   *  1101   *        120        *
  |         |         |         |                   |
  |         |         |         |                   |
  |         |         |         |                   |
  *   10    *---------*---------*---------*---------*
  |         |                   |         |         |
  |         |        111        |         |         |
  |         |                   |         |         |
  *         *---------*---------*  1210   *  1211   *
  |         |         |  11210  |         |         |
  |         |  1120   *---------*         |         |
  |         |         |  11211  |         |         |
  *---------*---------*---------*---------*---------*
*/
describe("with a complex tree", () => {
	describe("serial movements which will walk all the tree", () => {
		it("performs a series of movements correctly", () => {
			let node = getAt(complexTree, 0);
			assert(node, "Node should exist");
			expect(node.data).toEqual("00");

			node = findSibling(node, "down");
			assert(node, "Node should exist");
			expect(node.data).toEqual("10");

			node = findSibling(node, "right");
			assert(node, "Node should exist");
			expect(node.data).toEqual("1100");

			node = findSibling(node, "up");
			assert(node, "Node should exist");
			expect(node.data).toEqual("00");

			node = findSibling(node, "right");
			assert(node, "Node should exist");
			expect(node.data).toEqual("010");

			node = findSibling(node, "down");
			assert(node, "Node should exist");
			expect(node.data).toEqual("011");

			node = findSibling(node, "down");
			assert(node, "Node should exist");
			expect(node.data).toEqual("120");

			node = findSibling(node, "down");
			assert(node, "Node should exist");
			expect(node.data).toEqual("1210");

			node = findSibling(node, "down");
			assert(node, "Node should exist");
			expect(node.data).toEqual("1210");

			node = findSibling(node, "left");
			assert(node, "Node should exist");
			expect(node.data).toEqual("11211");

			node = findSibling(node, "left");
			assert(node, "Node should exist");
			expect(node.data).toEqual("1120");

			node = findSibling(node, "up");
			assert(node, "Node should exist");
			expect(node.data).toEqual("111");

			node = findSibling(node, "right");
			assert(node, "Node should exist");
			expect(node.data).toEqual("1210");

			node = findSibling(node, "up");
			assert(node, "Node should exist");
			expect(node.data).toEqual("120");

			node = findSibling(node, "left");
			assert(node, "Node should exist");
			expect(node.data).toEqual("1101");

			node = findSibling(node, "down");
			assert(node, "Node should exist");
			expect(node.data).toEqual("111");

			node = findSibling(node, "down");
			assert(node, "Node should exist");
			expect(node.data).toEqual("1120");

			node = findSibling(node, "right");
			assert(node, "Node should exist");
			expect(node.data).toEqual("11210");

			node = findSibling(node, "down");
			assert(node, "Node should exist");
			expect(node.data).toEqual("11211");

			node = findSibling(node, "right");
			assert(node, "Node should exist");
			expect(node.data).toEqual("1210");

			node = findSibling(node, "right");
			assert(node, "Node should exist");
			expect(node.data).toEqual("1211");

			node = findSibling(node, "up");
			assert(node, "Node should exist");
			expect(node.data).toEqual("120");

			node = findSibling(node, "up");
			assert(node, "Node should exist");
			expect(node.data).toEqual("011");

			node = findSibling(node, "left");
			assert(node, "Node should exist");
			expect(node.data).toEqual("00");
		});
	});
});
