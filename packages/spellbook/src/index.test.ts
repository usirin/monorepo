import {describe, expect, it} from "bun:test";
import {z} from "zod";
import {createSpellCaster} from "./caster";
import {createSpellbookServer} from "./server";
import {createSpell, createSpellbook} from "./spellbook";

import {
	createClientTransport,
	createEmitterPair,
	createServerTransport,
} from "./transports/emitter";

describe("@usirin/spellbook", () => {
	const spellbook = createSpellbook({
		frostbolt: createSpell({
			description: "Casts a frostbolt at the target",
			parameters: z.object({
				target: z.string(),
			}),
			execute: async ({target}) => {
				return {damage: 10, target};
			},
			result: z.object({damage: z.number(), target: z.string()}),
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

	const [client, server] = createEmitterPair();
	const clientTransport = createClientTransport(client);
	const serverTransport = createServerTransport(server);

	it("everything works together", async () => {
		const server = createSpellbookServer(spellbook, {
			transport: serverTransport,
		});

		server.start();

		const caster = createSpellCaster({
			transport: clientTransport,
		});

		const frostbolt = await caster.cast("frostbolt", {target: "enemy"});
		expect(frostbolt).toEqual({damage: 10, target: "enemy"});
	});
});
