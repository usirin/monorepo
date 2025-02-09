import {afterEach, beforeEach, describe, expect, it} from "bun:test";
import {createRunekeeper} from "./index";
import {setupTestEnv, teardownTestEnv} from "./test-helpers";

describe("createRunekeeper", () => {
	let runekeeper: ReturnType<typeof createRunekeeper>;

	beforeEach(() => {
		setupTestEnv();
		runekeeper = createRunekeeper(["normal", "insert"]);
	});

	afterEach(() => {
		teardownTestEnv();
	});

	it("should handle a single key press", () => {
		const event = new KeyboardEvent("keydown", {key: "a"});
		runekeeper.handleKeyPress(event, "normal");
		const snapshot = runekeeper.getSnapshot();
		expect(snapshot.context.buffer).toEqual(["a"]);
	});

	it("should handle a mapped sequence in the current mode", async () => {
		runekeeper.map("normal", "jk", () => {});
		const event1 = new KeyboardEvent("keydown", {key: "j"});
		runekeeper.handleKeyPress(event1, "normal");
		const event2 = new KeyboardEvent("keydown", {key: "k"});
		runekeeper.handleKeyPress(event2, "normal");
		const snapshot = runekeeper.getSnapshot();
		expect(snapshot.context.history).toContain("jk");
	});

	it("should not execute commands mapped to other modes", () => {
		runekeeper.map("insert", "jk", () => {});
		const event1 = new KeyboardEvent("keydown", {key: "j"});
		runekeeper.handleKeyPress(event1, "normal");
		const event2 = new KeyboardEvent("keydown", {key: "k"});
		runekeeper.handleKeyPress(event2, "normal");
		const snapshot = runekeeper.getSnapshot();
		expect(snapshot.context.history).not.toContain("jk");
	});

	it("should handle a complex key", () => {
		let commandExecuted = false;
		runekeeper.map("normal", "<c-a>", () => {
			commandExecuted = true;
		});

		const event = new KeyboardEvent("keydown", {
			key: "a",
			ctrlKey: true,
			code: "KeyA",
			which: 65,
		});

		runekeeper.handleKeyPress(event, "normal");
		const snapshot = runekeeper.getSnapshot();

		expect(commandExecuted).toBe(true);
		expect(snapshot.context.history).toContain("<c-a>");
	});

	describe("timeout behavior", () => {
		it("should clear the buffer after timeout", async () => {
			const event = new KeyboardEvent("keydown", {key: "j"});
			runekeeper.handleKeyPress(event, "normal");
			await new Promise((resolve) => setTimeout(resolve, 1100));
			const snapshot = runekeeper.getSnapshot();
			expect(snapshot.context.buffer).toEqual([]);
		});
	});
});
