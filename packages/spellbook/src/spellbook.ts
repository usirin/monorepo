import type {StandardSchemaV1 as StandardV1} from "@standard-schema/spec";
import {factory} from "@usirin/forge";
import {standardValidate} from "./validate-standard-schema";

interface SpellSpec<
	TParamsSchema extends StandardV1 = StandardV1<any, any>,
	TResultSchema extends StandardV1 = StandardV1<any, any>,
> {
	description: string;
	parameters: TParamsSchema;
	result: TResultSchema;
	execute: (
		parameters: StandardV1.InferOutput<TParamsSchema>,
	) => Promise<StandardV1.InferOutput<TResultSchema>>;
}

export const createSpell = factory(
	"spell",
	<TParams extends StandardV1, TResult extends StandardV1>(spec: SpellSpec<TParams, TResult>) =>
		spec,
);

export type Spell<
	TParamsSchema extends StandardV1 = StandardV1<any, any>,
	TResultSchema extends StandardV1 = StandardV1<any, any>,
> = ReturnType<typeof createSpell<TParamsSchema, TResultSchema>>;

export const createSpellbook = factory(
	"spellbook",
	<TSpells extends Record<string, Spell>>(spells: TSpells = {} as TSpells) => ({
		spells,
	}),
);

export type Spellbook = ReturnType<typeof createSpellbook>;

export async function execute<
	TSpellbook extends Spellbook = Spellbook,
	TSpellName extends keyof TSpellbook["spells"] = keyof TSpellbook["spells"],
>(
	spellbook: TSpellbook,
	name: TSpellName,
	parameters: StandardV1.InferInput<TSpellbook["spells"][TSpellName]["parameters"]>,
) {
	const spell = spellbook.spells[name as string];
	if (!spell) {
		throw new Error(`Spell not found: ${name as string}`);
	}

	const validated = await standardValidate(spell.parameters, parameters);

	const result = await spell.execute(validated);

	const validatedResult = await standardValidate(spell.result, result);

	return validatedResult;
}
