import {describe, expect, it} from "bun:test";
import {createSpell, createSpellbook} from "@usirin/spellbook";
import {z} from "zod";
import {cast} from "../caster";
import {serve} from "../server";
import {createClientTransport, createEmitterPair, createServerTransport} from "./emitter";

const spellbook = createSpellbook({
	frostbolt: createSpell({
		description: "Casts a frostbolt at the target",
		parameters: z.object({target: z.string()}),
		result: z.object({damage: z.number(), target: z.string()}),
		execute: async ({target}) => {
			return {damage: 10, target};
		},
	}),
	fireball: createSpell({
		description: "Casts a fireball at the target",
		parameters: z.object({target: z.string()}),
		result: z.object({damage: z.number(), target: z.string()}),
		execute: async ({target}) => {
			return {damage: 20, target};
		},
	}),
});

describe("emitter transport", () => {
	it("should work", async () => {
		const [client, server] = createEmitterPair();

		const respTransport = createServerTransport(server);
		serve(spellbook, respTransport);

		const reqTransport = createClientTransport(client);
		const res = await cast<typeof spellbook>(reqTransport, "frostbolt", {target: "enemy"});
		expect(res).toEqual({damage: 10, target: "enemy"});

		const res2 = await cast<typeof spellbook>(reqTransport, "fireball", {target: "umut"});
		expect(res2).toEqual({damage: 20, target: "umut"});
	});
});
