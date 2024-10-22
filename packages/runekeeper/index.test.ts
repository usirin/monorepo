import {beforeEach, describe, expect, it} from "bun:test";
import {createRunekeeper} from "./index";

describe("createRunekeeper", () => {
	let runekeeper: ReturnType<typeof createRunekeeper>;

	beforeEach(() => {
		runekeeper = createRunekeeper(["normal", "insert"]);
	});

	it("should handle a single key press", () => {
		runekeeper.handleKeyPress("a", "normal");
		const snapshot = runekeeper.getSnapshot();
		expect(snapshot.context.buffer).toEqual(["a"]);
	});

	it("should handle a mapped sequence in the current mode", async () => {
		runekeeper.map("normal", "jk", () => {});
		runekeeper.handleKeyPress("j", "normal");
		runekeeper.handleKeyPress("k", "normal");
		const snapshot = runekeeper.getSnapshot();
		expect(snapshot.context.history).toContain("jk");
	});

	it("should not execute commands mapped to other modes", () => {
		runekeeper.map("insert", "jk", () => {});
		runekeeper.handleKeyPress("j", "normal");
		runekeeper.handleKeyPress("k", "normal");
		const snapshot = runekeeper.getSnapshot();
		expect(snapshot.context.history).not.toContain("jk");
	});

	it("should handle a complex key", () => {
		runekeeper.map("normal", "<c-a>", () => {
			expect(true).toBe(true);
		});
		runekeeper.handleKeyPress("<c-a>", "normal");
		const snapshot = runekeeper.getSnapshot();
		expect(snapshot.context.history).toContain("<c-a>");
	});

	describe("timeout behavior", () => {
		it("should clear the buffer after timeout", async () => {
			runekeeper.handleKeyPress("j", "normal");
			await new Promise((resolve) => setTimeout(resolve, 600));
			const snapshot = runekeeper.getSnapshot();
			expect(snapshot.context.buffer).toEqual([]);
		});
	});
});
