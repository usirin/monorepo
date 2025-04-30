import {describe, expect, it} from "bun:test";
import * as v from "valibot";
import {z} from "zod";

import {createSpell, createSpellbook} from "./fn";

describe("createSpell", () => {
	it("works with zod", async () => {
		// Define a context schema
		const contextSchema = z.object({
			bonusDamage: z.number(),
		});

		const frostbolt = createSpell({
			description: "Casts a frostbolt at the target",
			parameters: z.object({target: z.string()}),
			result: z.object({damage: z.number(), target: z.string()}),
			context: contextSchema, // Specify the context schema
			execute: async ({target}, context) => {
				return {damage: 10 + context.bonusDamage, target};
			},
		});

		const context = {bonusDamage: 5};
		expect(await frostbolt({target: "enemy"}, context)).toEqual({damage: 15, target: "enemy"});
	});

	it("works with valibot", async () => {
		// Define a context schema with valibot
		const contextSchema = v.object({
			bonusDamage: v.number(),
		});

		const frostbolt = createSpell({
			description: "Casts a frostbolt at the target",
			parameters: v.object({target: v.string()}),
			result: z.object({damage: z.number(), target: z.string()}),
			context: contextSchema, // Specify the context schema
			execute: async ({target}, context) => {
				return {damage: 10 + context.bonusDamage, target};
			},
		});

		const context = {bonusDamage: 5};
		const result = await frostbolt({target: "enemy"}, context);

		expect(result).toEqual({damage: 15, target: "enemy"});
	});

	it("works with no context schema", async () => {
		const frostbolt = createSpell({
			description: "Casts a frostbolt at the target",
			parameters: z.object({target: z.string()}),
			result: z.object({damage: z.number(), target: z.string()}),
			// No context schema defined
			execute: async ({target}, context) => {
				return {damage: 10, target};
			},
		});

		const result = await frostbolt({target: "enemy"}, {});
		expect(result).toEqual({damage: 10, target: "enemy"});
	});
});

describe("createSpellbook", () => {
	// Define context schemas for each spell
	const damageBoostSchema = z.object({
		bonusDamage: z.number().optional().default(0),
	});

	const manaSchema = z.object({
		mana: z.number().optional().default(0),
	});

	const frostbolt = createSpell({
		description: "Casts a frostbolt at the target",
		parameters: z.object({target: z.string()}),
		result: z.object({damage: z.number(), target: z.string()}),
		context: damageBoostSchema,
		execute: async ({target}, context) => {
			return {damage: 10 + context.bonusDamage, target};
		},
	});

	const fireball = createSpell({
		description: "Casts a fireball at the target",
		parameters: z.object({target: z.string()}),
		result: z.object({damage: z.number(), target: z.string()}),
		context: manaSchema,
		execute: async ({target}, context) => {
			// Uses mana from context
			return {damage: 20 + Math.floor(context.mana / 10), target};
		},
	});

	// Advanced spell that needs both context schemas
	const advancedSpell = createSpell({
		description: "Casts an advanced spell combining frost and fire",
		parameters: z.object({target: z.string()}),
		result: z.object({damage: z.number(), target: z.string()}),
		// Context needs both bonusDamage and mana
		context: z.object({
			bonusDamage: z.number().optional().default(0),
			mana: z.number().optional().default(0),
		}),
		execute: async ({target}, context) => {
			return {
				damage: 30 + context.bonusDamage + Math.floor(context.mana / 10),
				target,
			};
		},
	});

	it("creates a spellbook with multiple spells and derived context", async () => {
		// Context contains all required fields from both spells
		const context = {bonusDamage: 5, mana: 100};
		const spellbook = createSpellbook(
			{
				frostbolt,
				fireball,
				advancedSpell,
			},
			context,
		);

		const frostboltResult = await spellbook.frostbolt({target: "enemy"});
		expect(frostboltResult).toEqual({damage: 15, target: "enemy"});

		const fireballResult = await spellbook.fireball({target: "enemy"});
		expect(fireballResult).toEqual({damage: 30, target: "enemy"}); // 20 + mana/10

		const advancedResult = await spellbook.advancedSpell({target: "enemy"});
		expect(advancedResult).toEqual({damage: 45, target: "enemy"}); // 30 + 5 + mana/10
	});

	it("creates a spellbook with partial context", async () => {
		// Only provide bonusDamage, not mana
		const context = {bonusDamage: 5};
		const spellbook = createSpellbook(
			{
				frostbolt,
				fireball,
			},
			context,
		);

		const frostboltResult = await spellbook.frostbolt({target: "enemy"});
		expect(frostboltResult).toEqual({damage: 15, target: "enemy"});

		const fireballResult = await spellbook.fireball({target: "enemy"});
		expect(fireballResult).toEqual({damage: 20, target: "enemy"}); // No mana bonus
	});
});
