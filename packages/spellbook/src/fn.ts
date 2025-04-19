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

export function createSpellbook<TSpells extends Record<string, Spell<any, any>>>(
	spells: TSpells = {} as TSpells,
) {
	return <TName extends keyof TSpells>(
		name: TName,
		parameters: Parameters<TSpells[TName]>[0],
	): Promise<StandardV1.InferOutput<TSpells[TName]["_spec"]["result"]>> => {
		const spell = spells[name];
		if (!spell) {
			throw new Error(`Spell not found: ${name as string}`);
		}

		return spell(parameters);
	};
}

export type Spellbook = ReturnType<typeof createSpellbook>;
