import {DurableObject} from "cloudflare:workers";
import {createSpell, createSpellbook} from "@usirin/spellbook/spellbook";
import {type SpellbookRequest, type SpellbookResponse, serve} from "@usirin/spellbook/spellcaster";
import {z} from "zod";

// Durable Object
export class Dispatcher extends DurableObject<Env> {
	spellbook = createSpellbook({
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

	async webSocketMessage(client: WebSocket, message: ArrayBuffer | string) {
		const wsTransport = {
			incoming: new ReadableStream<SpellbookRequest<typeof this.spellbook>>({
				start(controller) {
					controller.enqueue(JSON.parse(message.toString()));
				},
			}),
			outgoing: new WritableStream<SpellbookResponse<typeof this.spellbook>>({
				write(response) {
					client.send(JSON.stringify(response));
				},
			}),
		};

		serve(this.spellbook, wsTransport);
	}

	async fetch(request: Request): Promise<Response> {
		// Creates two ends of a WebSocket connection.
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		this.ctx.acceptWebSocket(server);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
		console.log("WebSocket closed", code, reason, wasClean);
		// If the client closes the connection, the runtime will invoke the webSocketClose() handler.
		ws.close(code, "Durable Object is closing WebSocket");
	}
}
