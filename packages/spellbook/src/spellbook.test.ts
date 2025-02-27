import {describe, expect, it} from "bun:test";
import * as v from "valibot";
import {z} from "zod";

import {createSpell, createSpellbook, execute} from "./spellbook";

describe("createSpell", () => {
	it("works with zod", async () => {
		const frostbolt = createSpell({
			description: "Casts a frostbolt at the target",
			parameters: z.object({target: z.string()}),
			result: z.object({damage: z.number(), target: z.string()}),
			execute: async ({target}) => {
				return {damage: 10, target};
			},
		});

		expect(await frostbolt.execute({target: "enemy"})).toEqual({damage: 10, target: "enemy"});
	});

	it("works with valibot", async () => {
		const frostbolt = createSpell({
			description: "Casts a frostbolt at the target",
			parameters: v.object({target: v.string()}),
			result: z.object({damage: z.number(), target: z.string()}),
			execute: async ({target}) => {
				return {damage: 10, target};
			},
		});

		expect(await frostbolt.execute({target: "enemy"})).toEqual({damage: 10, target: "enemy"});
	});
});

describe("createSpellbook", () => {
	const frostbolt = createSpell({
		description: "Casts a frostbolt at the target",
		parameters: z.object({target: z.string()}),
		result: z.object({damage: z.number(), target: z.string()}),
		execute: async ({target}) => {
			return {damage: 10, target};
		},
	});

	const fireball = createSpell({
		description: "Casts a fireball at the target",
		parameters: z.object({target: z.string()}),
		result: z.object({damage: z.number(), target: z.string()}),
		execute: async ({target}) => {
			return {damage: 20, target};
		},
	});

	it("creates a spellbook with multiple spells", async () => {
		const spellbook = createSpellbook({
			frostbolt,
			fireball,
		});

		expect(await execute(spellbook, "frostbolt", {target: "enemy"})).toEqual({
			damage: 10,
			target: "enemy",
		});
		expect(await execute(spellbook, "fireball", {target: "enemy"})).toEqual({
			damage: 20,
			target: "enemy",
		});
	});
});
