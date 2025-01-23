import {describe, expect, it} from "bun:test";
import {z} from "zod";
import {Spellbook, createSpellbook, defineCommand} from "./index";

describe("spellbook", () => {
	it("should define a command", () => {
		const spellbook = createSpellbook({
			test: defineCommand({
				description: "Test command",
				input: z.object({foo: z.string().optional().default("bar")}).default({}),
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

		spellbook.execute("test");
		spellbook.execute("foo", {bar: "baz"});
	});
});

describe("Spellbook.create", () => {
	it("should create a new spellbook using builder pattern", () => {
		const spellbook = Spellbook.create()
			.command("test", {
				description: "Test command",
				input: z.object({foo: z.string().optional().default("bar")}).default({}),
				execute: ({foo}) => {
					expect(foo).toBe("bar");
				},
			})
			.command("foo", {
				description: "Foo command",
				input: z.object({bar: z.string()}),
				execute: ({bar}) => {
					expect(bar).toBe("baz");
				},
			})
			.build();
		spellbook.execute("test");
		spellbook.execute("foo", {bar: "baz"});
	});
});
