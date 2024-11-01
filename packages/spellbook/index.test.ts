import {describe, expect, it} from "bun:test";
import {z} from "zod";
import {createSpellbook, defineCommand} from "./index";

describe("spellbook", () => {
	it("should define a command", () => {
		const spellbook = createSpellbook({
			test: defineCommand({
				description: "Test command",
				input: z.object({foo: z.string()}),
				execute: ({foo}) => {
					expect(foo).toBe("bar");
				},
			}),
			foo: defineCommand({
				description: "Foo command",
				input: z.object({bar: z.string()}),
				execute: ({bar}) => {
					expect(bar).toBe("baz");
				},
			}),
		});

		spellbook.execute("test", {foo: "bar"});
		spellbook.execute("foo", {bar: "baz"});
	});
});
