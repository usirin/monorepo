import type {StandardSchemaV1 as StandardV1} from "@standard-schema/spec";
import type {SpellSpec} from "./types";
import {standardValidate} from "./validate-standard-schema";

export function createSpell<TParams extends StandardV1, TResult extends StandardV1>(
	spec: SpellSpec<TParams, TResult>,
) {
	const spell = async (
		parameters: StandardV1.InferInput<TParams>,
	): Promise<StandardV1.InferOutput<TResult>> => {
		const validatedParams = await standardValidate(spec.parameters, parameters);

		const result = await spec.execute(validatedParams);

		const validatedResult = await standardValidate(spec.result, result);

		return validatedResult;
	};

	spell._spec = spec;
	spell._tag = "spell";

	return spell;
}

export type Spell<
	TParamsSchema extends StandardV1 = StandardV1<any, any>,
	TResultSchema extends StandardV1 = StandardV1<any, any>,
> = {
	(
		parameters: StandardV1.InferInput<TParamsSchema>,
	): Promise<StandardV1.InferOutput<TResultSchema>>;
	_spec: SpellSpec<TParamsSchema, TResultSchema>;
	_tag: string;
};

export function createSpellbook<TSpells extends Record<string, Spell<any, any>>>(spells: TSpells) {
	return spells;
}

export type Spellbook<
	TSpells extends Record<string, Spell<any, any>> = Record<string, Spell<any, any>>,
> = {
	[K in keyof TSpells]: TSpells[K];
};
