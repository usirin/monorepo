import {describe, expect, it} from "bun:test";
import {
	createWorkspace,
	focusWindow,
	getWindowAt,
	moveWindowAfter,
	moveWindowBefore,
	removeWindow,
	splitWindow,
	updateWindow,
} from "./workspace";

describe("createWorkspace", () => {
	it("should create a workspace with default state", () => {
		const workspace = createWorkspace();
		expect(workspace.focused).toEqual([0]);
		expect(workspace.layout.root.children.length).toBe(1);
		const window = workspace.layout.root.children[0];
		expect(window.tag).toBe("window");
		expect(window.tag === "window" && window.key).toBe("scratch");
	});
});

describe("focusWindow", () => {
	it("should update focused path", () => {
		const workspace = createWorkspace();
		const newWorkspace = focusWindow(workspace, [1]);
		expect(newWorkspace.focused).toEqual([1]);
		// Original workspace should be unchanged
		expect(workspace.focused).toEqual([0]);
	});
});

describe("splitWindow", () => {
	it("should split window vertically", () => {
		const workspace = createWorkspace();
		const newWorkspace = splitWindow(workspace, "vertical");
		expect(newWorkspace.layout.root.children.length).toBe(2);
		expect(newWorkspace.layout.root.children[0].tag).toBe("window");
		expect(newWorkspace.layout.root.children[1].tag).toBe("window");
		// Original workspace should be unchanged
		expect(workspace.layout.root.children.length).toBe(1);
	});

	it("should split window horizontally", () => {
		const workspace = createWorkspace();
		const newWorkspace = splitWindow(workspace, "horizontal");
		expect(newWorkspace.layout.root.children.length).toBe(2);
		expect(newWorkspace.layout.root.children[0].tag).toBe("window");
		expect(newWorkspace.layout.root.children[1].tag).toBe("window");
	});

	it("should split specific window when path is provided", () => {
		const workspace = createWorkspace();
		const withSplit = splitWindow(workspace, "vertical");
		const newWorkspace = splitWindow(withSplit, "horizontal", [1]);
		expect(newWorkspace.layout.root.children.length).toBe(2);
		expect(newWorkspace.layout.root.children[1].tag).toBe("stack");
	});
});

describe("updateWindow", () => {
	it("should update window key", () => {
		const workspace = createWorkspace();
		const newWorkspace = updateWindow(workspace, [0], "newKey");
		const window = getWindowAt(newWorkspace, [0]);
		expect(window?.key).toBe("newKey");
		// Original workspace should be unchanged
		expect(getWindowAt(workspace, [0])?.key).toBe("scratch");
	});
});

describe("removeWindow", () => {
	it("should remove window", () => {
		const workspace = createWorkspace();
		const withSplit = splitWindow(workspace, "vertical");
		const newWorkspace = removeWindow(withSplit, [0]);
		expect(newWorkspace.layout.root.children.length).toBe(1);
		// Original workspace should be unchanged
		expect(withSplit.layout.root.children.length).toBe(2);
	});
});

describe("moveWindowBefore", () => {
	it("should move window before target", () => {
		const workspace = createWorkspace();
		const withSplit = splitWindow(workspace, "vertical");
		const withUpdate = updateWindow(withSplit, [1], "target");
		const newWorkspace = moveWindowBefore(withUpdate, [1], [0]);
		expect(getWindowAt(newWorkspace, [0])?.key).toBe("target");
	});
});

describe("moveWindowAfter", () => {
	it("should move window after target", () => {
		const workspace = createWorkspace();
		const withSplit = splitWindow(workspace, "vertical");
		const withUpdate = updateWindow(withSplit, [0], "target");
		const newWorkspace = moveWindowAfter(withUpdate, [0], [1]);
		expect(getWindowAt(newWorkspace, [1])?.key).toBe("target");
	});
});

describe("getWindowAt", () => {
	it("should return window at path", () => {
		const workspace = createWorkspace();
		const window = getWindowAt(workspace, [0]);
		expect(window?.key).toBe("scratch");
	});

	it("should return null for invalid path", () => {
		const workspace = createWorkspace();
		const window = getWindowAt(workspace, [1]);
		expect(window).toBe(null);
	});

	it("should return window after multiple splits", () => {
		const workspace = createWorkspace();
		// First split creates two windows side by side
		const withHorizontalSplit = splitWindow(workspace, "horizontal");
		// Second split with different orientation creates a stack
		const withStack = splitWindow(withHorizontalSplit, "vertical", [0]);
		// Now [0, 0] should be a window
		const window = getWindowAt(withStack, [0, 0]);
		expect(window?.key).toBe("scratch");
	});
});
