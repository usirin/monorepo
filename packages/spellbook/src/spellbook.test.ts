import {describe, expect, it} from "bun:test";
import * as v from "valibot";
import {z} from "zod";

import {createSpell, createSpellCaster, createSpellbook} from "./spellbook";

describe("createSpell", () => {
	it("creates a single executable spell with input validation using zod", async () => {
		const frostbolt = createSpell({
			description: "Casts a frostbolt at the target",
			parameters: z.object({target: z.string()}),
			execute: async ({target}) => {
				return {damage: 10, target};
			},
		});

		expect(await frostbolt.execute({target: "enemy"})).toEqual({damage: 10, target: "enemy"});
	});

	it("creates a single executable spell with input validation using valibot", async () => {
		const frostbolt = createSpell({
			description: "Casts a frostbolt at the target",
			parameters: v.object({target: v.string()}),
			execute: async ({target}) => {
				return {damage: 10, target};
			},
		});

		expect(await frostbolt.execute({target: "enemy"})).toEqual({damage: 10, target: "enemy"});
	});
});
const frostbolt = createSpell({
	description: "Casts a frostbolt at the target",
	parameters: z.object({target: z.string()}),
	execute: async ({target}) => {
		return {damage: 10, target};
	},
});

const fireball = createSpell({
	description: "Casts a fireball at the target",
	parameters: z.object({target: z.string()}),
	execute: async ({target}) => {
		return {damage: 20, target};
	},
});

describe("createSpellbook", () => {
	it("creates a spellbook with multiple spells", async () => {
		const spellbook = createSpellbook({
			frostbolt,
			fireball,
		});

		expect(await spellbook.execute("frostbolt", {target: "enemy"})).toEqual({
			damage: 10,
			target: "enemy",
		});
		expect(await spellbook.execute("fireball", {target: "enemy"})).toEqual({
			damage: 20,
			target: "enemy",
		});
	});
});
