import {describe, expect, it} from "bun:test";
import * as v from "valibot";
import {z} from "zod";

import {createSpell, createSpellbook} from "./spellbook";

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
			context: contextSchema,
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

	it("makes context optional", async () => {
		const frostbolt = createSpell({
			description: "Casts a frostbolt at the target",
			parameters: z.object({target: z.string()}),
			result: z.object({damage: z.number(), target: z.string()}),
			context: v.void(),
			execute: async ({target}, _context) => {
				return {damage: 10, target};
			},
		});

		const result = await frostbolt({target: "enemy"});
		expect(result).toEqual({damage: 10, target: "enemy"});
	});
});

describe("createSpellbook", () => {
	const manaSchema = z.object({
		mana: z.object({current: z.number(), max: z.number()}),
	});

	const spellResultSchema = z.object({
		success: z.boolean(),
		damage: z.number().optional(),
		target: z.string().optional(),
		message: z.string().optional(),
		manaRemaining: z.number(),
	});

	const frostbolt = createSpell({
		description: "Casts a frostbolt at the target, costs 10 mana",
		parameters: z.object({target: z.string()}),
		result: spellResultSchema,
		context: manaSchema.extend({bonusDamage: z.number().optional().default(0)}),
		execute: async ({target}, context) => {
			const manaCost = 10;

			// Check if there's enough mana
			if (context.mana.current < manaCost) {
				return {
					success: false,
					message: "Not enough mana to cast Frostbolt",
					manaRemaining: context.mana.current,
				};
			}

			// Instead of modifying the context object, just track the new value
			const remainingMana = context.mana.current - manaCost;

			return {
				success: true,
				damage: 10 + context.bonusDamage,
				target,
				manaRemaining: remainingMana,
			};
		},
	});

	const fireball = createSpell({
		description: "Casts a fireball at the target, costs 25 mana",
		parameters: z.object({target: z.string()}),
		result: spellResultSchema,
		context: manaSchema,
		execute: async ({target}, context) => {
			const manaCost = 25;

			// Check if there's enough mana
			if (context.mana.current < manaCost) {
				return {
					success: false,
					message: "Not enough mana to cast Fireball",
					manaRemaining: context.mana.current,
				};
			}

			// Instead of modifying the context object, just track the new value
			const remainingMana = context.mana.current - manaCost;

			return {
				success: true,
				damage: 20,
				target,
				manaRemaining: remainingMana,
			};
		},
	});

	it("creates a spellbook with multiple spells and derived context", async () => {
		// Context contains all required fields with plenty of mana
		const context = {
			bonusDamage: 5,
			mana: {current: 100, max: 100},
		};

		const spellbook = createSpellbook({frostbolt, fireball}, context);

		// Cast frostbolt (costs 10 mana)
		let currentMana = 100;
		const frostboltResult = await spellbook.frostbolt({target: "enemy"});
		expect(frostboltResult).toEqual({
			success: true,
			damage: 15,
			target: "enemy",
			manaRemaining: 90,
		});

		// Update our tracking variable with the new mana value
		currentMana = frostboltResult.manaRemaining;

		// For subsequent tests, manually update the context for the next spell
		context.mana.current = currentMana;

		// Cast fireball (costs 25 mana)
		const fireballResult = await spellbook.fireball({target: "enemy"});
		expect(fireballResult).toEqual({
			success: true,
			damage: 20,
			target: "enemy",
			manaRemaining: 65,
		});
	});

	it("handles insufficient mana", async () => {
		// Context with low mana
		const context = {
			bonusDamage: 5,
			mana: {current: 30, max: 100},
		};

		const spellbook = createSpellbook({frostbolt, fireball}, context);

		// Cast frostbolt (costs 10 mana)
		let currentMana = 30;
		const frostboltResult = await spellbook.frostbolt({target: "enemy"});
		expect(frostboltResult).toEqual({
			success: true,
			damage: 15,
			target: "enemy",
			manaRemaining: 20,
		});

		// Update our tracking variable
		currentMana = frostboltResult.manaRemaining;
		context.mana.current = currentMana;

		// Cast fireball (costs 25 mana) - should fail due to insufficient mana
		const fireballResult = await spellbook.fireball({target: "enemy"});
		expect(fireballResult).toEqual({
			success: false,
			message: "Not enough mana to cast Fireball",
			manaRemaining: 20,
		});

		// Mana shouldn't have changed since the spell failed
		expect(fireballResult.manaRemaining).toEqual(20);

		// Cast frostbolt again (costs 10 mana)
		const secondFrostbolt = await spellbook.frostbolt({target: "enemy"});
		expect(secondFrostbolt).toEqual({
			success: true,
			damage: 15,
			target: "enemy",
			manaRemaining: 10,
		});
	});

	it("builds up a req/resp fetch function", async () => {
		const spellbook = createSpellbook(
			{
				fetch: createSpell({
					description: "Fetches a resource from the server",
					parameters: z.instanceof(Request),
					result: z.instanceof(Response),
					context: z.object({db: z.object({get: z.function().args(z.string()).returns(z.any())})}),
					execute: async (request, context) => {
						return new Response(context.db.get(request.url));
					},
				}),
			},
			{db: {get: () => "hello"}},
		);

		const result = await spellbook.fetch(new Request("https://example.com"));
		expect(result).toEqual(new Response("hello"));
	});
});
