import type {StandardSchemaV1} from "@standard-schema/spec";
import {factory} from "@usirin/forge";
import {execute, type Spellbook} from "@usirin/spellbook";

interface RequestSpec<TName extends keyof Spellbook["spells"] = keyof Spellbook["spells"]> {
	name: TName;
	parameters: StandardSchemaV1.InferInput<Spellbook["spells"][TName]["parameters"]>;
}

export const createRequest = factory("req", ({name, parameters}: RequestSpec) => ({
	name,
	parameters,
}));

export type Request = ReturnType<typeof createRequest>;

interface ResponseSpec<TName extends keyof Spellbook["spells"] = keyof Spellbook["spells"]> {
	request: Request;
	result?: ReturnType<Spellbook["spells"][TName]["execute"]>;
	error?: {message: string; code?: string; details?: unknown};
}

export const createResponse = factory("resp", ({request, result, error}: ResponseSpec) => ({
	request,
	result,
	error,
}));

export type Response = ReturnType<typeof createResponse>;

export function createSpellbookStream(spellbook: Spellbook) {
	return new TransformStream<Request, Response>({
		async transform(request, controller) {
			try {
				const result = await execute(spellbook, request.name, request.parameters);
				const response = createResponse({request, result});
				controller.enqueue(response);
			} catch (error) {
				if (error instanceof Error) {
					const response = createResponse({request, error: {message: error.message}});
					controller.enqueue(response);
				}
			}
		},
	});
}

interface ServerTransportSpec {
	incoming: ReadableStream<Request>;
	outgoing: WritableStream<Response>;
}

export const createServerTransport = factory(
	"xports",
	({incoming, outgoing}: ServerTransportSpec) => ({
		incoming,
		outgoing,
	}),
);

export type ServerTransport = ReturnType<typeof createServerTransport>;

interface ClientTransportSpec {
	incoming: ReadableStream<Response>;
	outgoing: WritableStream<Request>;
}

export const createClientTransport = factory(
	"xportc",
	({incoming, outgoing}: ClientTransportSpec) => ({
		incoming,
		outgoing,
	}),
);

export type ClientTransport = ReturnType<typeof createClientTransport>;
