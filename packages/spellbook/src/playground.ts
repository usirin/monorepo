import {z} from "zod";
import {createSpell, createSpellbook} from "./spellbook";

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

interface SpellbookRequest<TSpell extends keyof typeof spellbook.spells> {
	id: string;
	name: TSpell;
	parameters: z.infer<(typeof spellbook.spells)[TSpell]["parameters"]>;
}

interface SpellbookResponse<TSpell extends keyof typeof spellbook.spells> {
	id: string;
	result: Awaited<ReturnType<(typeof spellbook.spells)[TSpell]["execute"]>>;
}

type Request = SpellbookRequest<keyof typeof spellbook.spells>;
type Response = SpellbookResponse<keyof typeof spellbook.spells>;

const readable = new ReadableStream<Request>({
	start(controller) {
		controller.enqueue({id: "1", name: "frostbolt", parameters: {target: "enemy"}});
		controller.close();
	},
});

interface SpellbookTransport {
	request: TransformStream<Request, Request>;
	response: TransformStream<Response, Response>;
}

const createMemoryTransport = (): SpellbookTransport => {
	const readable = new TransformStream<Request, Request>({
		async transform(chunk, controller) {
			controller.enqueue(chunk);
		},
	});

	const writable = new TransformStream<Response, Response>({
		async transform(chunk, controller) {
			controller.enqueue(chunk);
		},
	});

	return {request: readable, response: writable};
};

const transformStream = new TransformStream<Request, Response>({
	async transform(chunk, controller) {
		controller.enqueue({
			id: chunk.id,
			result: await spellbook.execute(chunk.name, chunk.parameters),
		});
	},
});

const writable = new WritableStream<Response>({
	write(chunk) {
		console.log(chunk);
	},
});

const transport = createMemoryTransport();

readable
	.pipeThrough(transport.request)
	.pipeThrough(transformStream)
	.pipeThrough(transport.response)
	.pipeTo(writable);
