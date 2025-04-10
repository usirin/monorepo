import type {StandardSchemaV1 as StandardV1} from "@standard-schema/spec";
import {factory} from "@usirin/forge";
import {standardValidate} from "./validate-standard-schema";

interface SpellSpec<TParamsSchema extends StandardV1, TResultSchema extends StandardV1> {
	description: string;
	parameters: TParamsSchema;
	result: TResultSchema;
	execute: (
		parameters: StandardV1.InferOutput<TParamsSchema>,
	) => Promise<StandardV1.InferOutput<TResultSchema>>;
}

export const createSpell = factory(
	"spell",
	<TParams extends StandardV1, TResult extends StandardV1>(spec: SpellSpec<TParams, TResult>) => {
		return {
			...spec,
			execute: async (
				parameters: StandardV1.InferInput<TParams>,
			): Promise<StandardV1.InferOutput<TResult>> => {
				const validatedParams = await standardValidate(spec.parameters, parameters);

				const result = await spec.execute(validatedParams);

				const validatedResult = await standardValidate(spec.result, result);

				return validatedResult;
			},
		};
	},
);

export type Spell<
	TParamsSchema extends StandardV1 = StandardV1<any, any>,
	TResultSchema extends StandardV1 = StandardV1<any, any>,
> = ReturnType<typeof createSpell<TParamsSchema, TResultSchema>>;

export const createSpellbook = factory(
	"spellbook",
	<TSpells extends Record<string, Spell>>(spells: TSpells = {} as TSpells) => ({
		spells,
		execute: async <TSpellName extends keyof TSpells>(
			name: TSpellName,
			parameters: StandardV1.InferInput<TSpells[TSpellName]["parameters"]>,
		): Promise<StandardV1.InferOutput<TSpells[TSpellName]["result"]>> => {
			const spell = spells[name];
			if (!spell) {
				throw new Error(`Spell not found: ${name as string}`);
			}

			return spell.execute(parameters);
		},
	}),
);

export type Spellbook = ReturnType<typeof createSpellbook>;
