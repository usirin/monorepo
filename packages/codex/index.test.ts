import {describe, expect, it} from "bun:test";
import {createCodex, definePlugin} from "./index";

// Declare test plugin context
declare module "." {
	interface CodexContext {
		a: string;
		b: string;
	}
}

describe("codex", () => {
	it("should register core plugins in correct order", async () => {
		const codex = createCodex();

		const pluginA = definePlugin({
			name: "a",
			version: "1.0.0",
			register: () => ({
				a: "hello",
			}),
		});

		const pluginB = definePlugin({
			name: "b",
			version: "1.0.0",
			dependencies: ["a"],
			register: (deps) => ({
				b: `says ${deps.a}`,
			}),
		});

		await codex.use([pluginB, pluginA]);
		const context = await codex.init();

		expect(context.a).toBe("hello");
		expect(context.b).toBe("says hello");
	});
});
