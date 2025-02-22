import type {StandardSchemaV1} from "@standard-schema/spec";
import type {Spellbook} from "./fp";
import {standardValidate} from "./validate-standard-schema";

export interface SpellbookRequest<
	TSpellbook extends Spellbook = Spellbook,
	TSpell extends keyof TSpellbook["spells"] = keyof TSpellbook["spells"],
> {
	id: string;
	spell: TSpell;
	parameters: StandardSchemaV1.InferInput<TSpellbook["spells"][TSpell]["parameters"]>;
}

export interface SpellbookResponse<
	TSpellbook extends Spellbook = Spellbook,
	TSpell extends keyof TSpellbook["spells"] = keyof TSpellbook["spells"],
> {
	id: string;
	result?: ReturnType<TSpellbook["spells"][TSpell]["execute"]>;
	error?: {message: string; code?: string; details?: unknown};
}

interface Transport<TSpellbook extends Spellbook = Spellbook> {
	incoming: ReadableStream<SpellbookRequest<TSpellbook>>;
	outgoing: WritableStream<SpellbookResponse<TSpellbook>>;
}

function createSpellbookStream<TSpellbook extends Spellbook>(spellbook: TSpellbook) {
	return new TransformStream<SpellbookRequest<TSpellbook>, SpellbookResponse<TSpellbook>>({
		async transform(request, controller) {
			const result = await execute(spellbook, request.spell as string, request.parameters);
			controller.enqueue({id: request.id, result});
		},
	});
}

export async function execute<
	TSpellbook extends Spellbook = Spellbook,
	TSpellName extends keyof TSpellbook["spells"] = keyof TSpellbook["spells"],
>(
	spellbook: TSpellbook,
	name: TSpellName,
	parameters: StandardSchemaV1.InferInput<TSpellbook["spells"][TSpellName]["parameters"]>,
) {
	const spell = spellbook.spells[name as string];
	if (!spell) {
		throw new Error(`Spell not found: ${name as string}`);
	}

	const validated = await standardValidate(spell.parameters, parameters);

	return spell.execute(validated);
}

export function serve<TSpellbook extends Spellbook>(
	spellbook: TSpellbook,
	transport: Transport<TSpellbook>,
) {
	return transport.incoming
		.pipeThrough(createSpellbookStream(spellbook))
		.pipeTo(transport.outgoing);
}
