import {describe, expect, it} from "bun:test";
import {EventEmitter} from "node:events";
import {z} from "zod";
import {createSpell, createSpellbook} from "./spellbook";
import {type SpellbookRequest, type SpellbookResponse, serve} from "./spellcaster";

describe("Spellcaster", () => {
	const spellbook = createSpellbook({
		frostbolt: createSpell({
			description: "Casts a frostbolt at the target",
			parameters: z.object({target: z.string()}),
			execute: async ({target}) => {
				return {damage: 10, target};
			},
		}),
		fireball: createSpell({
			description: "Casts a fireball at the target",
			parameters: z.object({target: z.string()}),
			execute: async ({target}) => {
				return {damage: 20, target};
			},
		}),
	});

	type MageSpellbook = typeof spellbook;

	it("serves the spellbook using an event emitter transport", () => {
		const emitter = new EventEmitter();

		const emitterTransport = {
			incoming: new ReadableStream<SpellbookRequest<MageSpellbook>>({
				start(controller) {
					emitter.on("request", (data: string | Uint8Array) => {
						const message = JSON.parse(data.toString());
						controller.enqueue(message);
					});
				},
			}),
			outgoing: new WritableStream<SpellbookResponse<MageSpellbook>>({
				write(response) {
					emitter.emit("response", JSON.stringify(response));
				},
			}),
		};

		serve(spellbook, emitterTransport);

		emitter.on("response", (data) => {
			console.log("response", data);
			const response = JSON.parse(data);
			expect(response.id).toBeDefined();
			expect(response.result).toBeDefined();
		});

		emitter.emit(
			"request",
			JSON.stringify({id: "1", spell: "frostbolt", parameters: {target: "enemy"}}),
		);
	});
});
