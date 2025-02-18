import {describe, expect, it} from "bun:test";
import {z} from "zod";
import {Spellbook} from "./index";

describe("Spellbook.create", () => {
	it("should create a new spellbook using builder pattern", async () => {
		const spellbook = Spellbook.create()
			.command("test", {
				description: "Test command",
				input: z.object({
					foo: z.string().optional().default("bar"),
				}),
				execute: async (context) => {
					expect(context.input.foo).toBe("bar");
					return "test-result";
				},
			})
			.command("foo", {
				description: "Foo command",
				input: z.object({bar: z.string()}),
				execute: async ({input}) => {
					expect(input.bar).toBe("baz");
				},
			})
			.command("nested:foo", {
				description: "Nested foo command",
				input: z.object({baz: z.string()}),
				execute: ({input}) => {
					expect(input.baz).toBe("qux");
					return 42;
				},
			})
			.build();

		const testResult = await spellbook.execute("test", {});
		expect(testResult).toBe("test-result");

		const fooResult = await spellbook.execute("foo", {bar: "baz"});
		expect(fooResult).toBe(undefined);

		const nestedResult = await spellbook.execute("nested:foo", {baz: "qux"});
		expect(nestedResult).toBe(42);
	});
});
