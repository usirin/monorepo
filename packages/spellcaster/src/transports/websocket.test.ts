import {afterAll, beforeAll, describe, expect, it} from "bun:test";
import {createSpell, createSpellbook} from "@usirin/spellbook";
import {WebSocket, WebSocketServer} from "ws";
import {z} from "zod";
import {cast} from "../caster";
import {serve} from "../server";
import {createClientWebSocketTransport, createServerWebSocketTransport} from "./websocket";

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

describe("websocket transport", () => {
	let wss: WebSocketServer;
	const PORT = 8088;

	beforeAll(() => {
		wss = new WebSocketServer({port: PORT});
	});

	afterAll(() => {
		wss.close();
	});

	it("should work", async () => {
		return new Promise<void>((resolve) => {
			wss.once("connection", async (ws) => {
				const serverTransport = createServerWebSocketTransport(ws);
				serve(spellbook, serverTransport);
			});

			const clientWs = new WebSocket(`ws://localhost:${PORT}`);

			clientWs.on("open", async () => {
				const clientTransport = createClientWebSocketTransport(clientWs);

				const res = await cast<typeof spellbook>(clientTransport, "frostbolt", {target: "enemy"});
				expect(res).toEqual({damage: 10, target: "enemy"});

				const res2 = await cast<typeof spellbook>(clientTransport, "fireball", {target: "umut"});
				expect(res2).toEqual({damage: 20, target: "umut"});

				clientWs.close();
				resolve();
			});
		});
	});
});
