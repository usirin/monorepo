import {describe, expect, it} from "bun:test";
import * as v from "valibot";
import {z} from "zod";

import {createSpell, createSpellbook} from "./fn";

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

		expect(await frostbolt({target: "enemy"})).toEqual({damage: 10, target: "enemy"});
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

		const result = await frostbolt({target: "enemy"});

		expect(result).toEqual({damage: 10, target: "enemy"});
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

		const frostboltResult = await spellbook.frostbolt({target: "enemy"});
		expect(frostboltResult).toEqual({damage: 10, target: "enemy"});

		const fireballResult = await spellbook.fireball({target: "enemy"});
		expect(fireballResult).toEqual({damage: 20, target: "enemy"});
	});
});
