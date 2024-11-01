import {describe, expect, it} from "bun:test";
import {createCodex, definePlugin} from "./index";

// Declare test plugin context
declare module "." {
	interface CodexContext {
		a: string;
		b: string;
		c: {
			value: number;
			nested: {
				data: string[];
			};
		};
	}
}

describe("codex", () => {
	it("should handle simple plugin registration", async () => {
		const codex = createCodex();

		const pluginA = definePlugin({
			name: "a",
			version: "1.0.0",
			register: () => "hello",
		});

		await codex.use([pluginA]);
		const context = await codex.init();

		expect(context.a).toBe("hello");
	});

	it("should handle plugin dependencies", async () => {
		const codex = createCodex();

		const pluginA = definePlugin({
			name: "a",
			version: "1.0.0",
			register: () => "hello",
		});

		const pluginB = definePlugin({
			name: "b",
			version: "1.0.0",
			dependencies: ["a"],
			register: (deps) => `says ${deps.a}`,
		});

		await codex.use([pluginB, pluginA]);
		const context = await codex.init();
		console.log({context});

		expect(context.a).toBe("hello");
		expect(context.b).toBe("says hello");
	});

	it("should handle complex nested dependencies", async () => {
		const codex = createCodex();

		const pluginA = definePlugin({
			name: "a",
			version: "1.0.0",
			register: () => "hello",
		});

		const pluginB = definePlugin({
			name: "b",
			version: "1.0.0",
			dependencies: ["a"],
			register: (deps) => `says ${deps.a}`,
		});

		const pluginC = definePlugin({
			name: "c",
			version: "1.0.0",
			dependencies: ["a", "b"],
			register: (deps) => ({
				value: deps.a.length + deps.b.length,
				nested: {
					data: [deps.a, deps.b],
				},
			}),
		});

		// Register in random order to test dependency resolution
		await codex.use([pluginC, pluginA, pluginB]);
		const context = await codex.init();
		expect(context.a).toBe("hello");
		expect(context.b).toBe("says hello");
		expect(context.c.nested.data).toEqual(["hello", "says hello"]);
	});

	it("should throw on missing dependencies", async () => {
		const codex = createCodex();

		const pluginB = definePlugin({
			name: "b",
			version: "1.0.0",
			dependencies: ["a"],
			register: (deps) => `says ${deps.a}`,
		});

		await codex.use([pluginB]);
		await expect(codex.init()).rejects.toThrow("Plugin not found: a");
	});

	it("should handle circular dependencies", async () => {
		const codex = createCodex();

		const pluginA = definePlugin({
			name: "a",
			version: "1.0.0",
			dependencies: ["b"],
			register: () => "hello",
		});

		const pluginB = definePlugin({
			name: "b",
			version: "1.0.0",
			dependencies: ["a"],
			register: () => "world",
		});

		await codex.use([pluginA, pluginB]);
		await expect(codex.init()).rejects.toThrow(/circular/i);
	});
});
