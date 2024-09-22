import {describe, it, expect} from "bun:test";
import {Node, NodeType} from "./Node";

describe("Node", () => {
	it("works", () => {
		const node = new Node(NodeType.Node, {a: "b"}, "vertical");

		expect(node.data).toEqual({a: "b"});
		expect(node.type).toEqual(NodeType.Node);
		expect(node.orientation).toEqual("vertical");
	});

	describe("setParent", () => {
		it("attaches itself to given parent", () => {
			const node = new Node(NodeType.Node, {a: "b"}, "vertical");
			const parent = new Node(NodeType.Parent, {}, "horizontal");

			node.setParent(parent);

			expect(node.parent).toEqual(parent);
		});
	});

	describe("clone", () => {
		it("clones given node", () => {
			const node = new Node(NodeType.Node, {a: "b"}, "vertical");
			const cloned = node.clone();

			expect(node).toEqual(cloned);
		});
	});

	describe("attachChildren", () => {
		it("attaches children and set their parent", () => {
			const parent = new Node(NodeType.Node, {a: "b"}, "vertical");

			parent.attachChildren([new Node(NodeType.Node, {id: 1}), new Node(NodeType.Node, {id: 2})]);

			expect((parent.children[0].data as {id: number}).id).toBe(1);
			expect((parent.children[1].data as {id: number}).id).toBe(2);
		});
	});

	describe("indexOf", () => {
		it("returns the index of given child", () => {
			const parent = new Node(NodeType.Node, {a: "b"}, "vertical");

			const child1 = new Node(NodeType.Node, {id: 1});
			const child2 = new Node(NodeType.Node, {id: 2});

			parent.attachChildren([child1, child2]);

			expect(parent.indexOf(child1)).toEqual(0);
			expect(parent.indexOf(child2)).toEqual(1);
		});
	});
});
